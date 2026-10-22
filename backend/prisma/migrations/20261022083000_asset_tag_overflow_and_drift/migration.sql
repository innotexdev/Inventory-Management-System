-- Asset tag overflow + schema drift reconciliation.
--
-- 0001_items_and_assignments was written before the review pass and was edited
-- in place afterwards, so databases that already applied it carry the old
-- shape. This migration is idempotent: it brings ANY database to the state
-- described by prisma/schema.prisma, whether it applied the original 0001 or
-- an already-reconciled one.
--
-- 1. assetTag overflow
--    The old default was 'INV-' || lpad(nextval(...)::text, 4, '0'), a fixed
--    width of 4. From 10000 items on, lpad() TRUNCATES instead of padding:
--    lpad('10000', 4, '0') = '1000', which collides with an existing tag and
--    fails the items_assetTag_key unique index. The generator below widens the
--    tag instead of truncating it.
--
-- 2. drift
--    - ItemStatus no longer has an ASSIGNED member: "is this item on loan?" is
--      derived from the assignments table (at most one active assignment per
--      item, enforced by assignments_one_active_per_item).
--    - assignments gets the two return-related CHECK constraints.
--    - users_email_ci_key is redundant: users_email_lowercase_ck already
--      forces every stored email to be lowercase, so users_email_key is
--      case-insensitive on its own.

-- ---------------------------------------------------------------------------
-- 1. Asset tag generator: widen, never truncate.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "next_asset_tag"()
RETURNS text AS $$
DECLARE
    n bigint;
BEGIN
    n := nextval('item_asset_tag_seq');
    RETURN 'INV-' || lpad(n::text, greatest(4, length(n::text)), '0');
END;
$$ LANGUAGE plpgsql;

-- Point the column default at the generator.
ALTER TABLE "items" ALTER COLUMN "assetTag" SET DEFAULT "next_asset_tag"();

-- ---------------------------------------------------------------------------
-- 2. Drop the redundant case-insensitive email index.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS "users_email_ci_key";

-- ---------------------------------------------------------------------------
-- 3. Return rules on assignments.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'assignments_returned_pair_ck'
    ) THEN
        ALTER TABLE "assignments"
            ADD CONSTRAINT "assignments_returned_pair_ck"
            CHECK (("returnedAt" IS NULL) = ("returnedById" IS NULL));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'assignments_returned_after_assigned_ck'
    ) THEN
        ALTER TABLE "assignments"
            ADD CONSTRAINT "assignments_returned_after_assigned_ck"
            CHECK ("returnedAt" IS NULL OR "returnedAt" >= "assignedAt");
    END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Remove the ASSIGNED value from ItemStatus.
--
--    Postgres cannot drop an enum value, so the type is rebuilt. Rows that were
--    ASSIGNED are on loan; that state lives in the assignments table now, so
--    the item itself goes back to AVAILABLE.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'ItemStatus' AND e.enumlabel = 'ASSIGNED'
    ) THEN
        UPDATE "items" SET "status" = 'AVAILABLE' WHERE "status" = 'ASSIGNED';

        ALTER TABLE "items" ALTER COLUMN "status" DROP DEFAULT;

        CREATE TYPE "ItemStatus_new" AS ENUM ('AVAILABLE', 'IN_REPAIR', 'RETIRED');

        ALTER TABLE "items"
            ALTER COLUMN "status" TYPE "ItemStatus_new"
            USING "status"::text::"ItemStatus_new";

        DROP TYPE "ItemStatus";
        ALTER TYPE "ItemStatus_new" RENAME TO "ItemStatus";

        ALTER TABLE "items" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
    END IF;
END
$$;
