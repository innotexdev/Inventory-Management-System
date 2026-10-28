CREATE OR REPLACE FUNCTION "next_asset_tag"()
RETURNS text AS $$
DECLARE
    n bigint;
BEGIN
    n := nextval('item_asset_tag_seq');
    RETURN 'INV-' || lpad(n::text, greatest(4, length(n::text)), '0');
END;
$$ LANGUAGE plpgsql;

ALTER TABLE "items" ALTER COLUMN "assetTag" SET DEFAULT "next_asset_tag"();

DROP INDEX IF EXISTS "users_email_ci_key";

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
