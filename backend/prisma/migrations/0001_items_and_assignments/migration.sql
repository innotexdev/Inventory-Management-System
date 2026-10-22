-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED');

-- Sequence backing Item.assetTag (INV-0001, INV-0002, ...).
-- Created BEFORE "items" because the column DEFAULT calls nextval() on it.
CREATE SEQUENCE IF NOT EXISTS "item_asset_tag_seq" START WITH 1;

-- Asset tag generator, used as the "items"."assetTag" DEFAULT.
--
CREATE OR REPLACE FUNCTION "next_asset_tag"()
RETURNS text AS $$
DECLARE
    n bigint;
BEGIN
    n := nextval('item_asset_tag_seq');
    RETURN 'INV-' || lpad(n::text, greatest(4, length(n::text)), '0');
END;
$$ LANGUAGE plpgsql;

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "assetTag" TEXT NOT NULL DEFAULT "next_asset_tag"(),
    "name" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "purchaseDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assignedById" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "returnedById" UUID,
    "note" TEXT,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id"),
    -- A return is all-or-nothing: returnedAt and returnedById are set together.
    CONSTRAINT "assignments_returned_pair_ck" CHECK (("returnedAt" IS NULL) = ("returnedById" IS NULL)),
    -- An item cannot be returned before it was assigned.
    CONSTRAINT "assignments_returned_after_assigned_ck" CHECK ("returnedAt" IS NULL OR "returnedAt" >= "assignedAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "items_assetTag_key" ON "items"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "items_serialNumber_key" ON "items"("serialNumber");

-- CreateIndex
CREATE INDEX "items_status_idx" ON "items"("status");

-- CreateIndex
CREATE INDEX "items_categoryId_idx" ON "items"("categoryId");

-- CreateIndex
CREATE INDEX "assignments_itemId_idx" ON "assignments"("itemId");

-- CreateIndex
CREATE INDEX "assignments_userId_idx" ON "assignments"("userId");

-- CreateIndex
CREATE INDEX "users_teamId_idx" ON "users"("teamId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Hardening below: rules the scope requires that Prisma cannot express.
-- ---------------------------------------------------------------------------

-- 1. At most one ACTIVE assignment per item (returnedAt IS NULL).
--    This is what makes concurrent assigns safe: the second INSERT fails.
CREATE UNIQUE INDEX "assignments_one_active_per_item"
    ON "assignments"("itemId")
    WHERE "returnedAt" IS NULL;

-- 2. Case-insensitive uniqueness (scope: team name, email, serialNumber).
--    Emails are also lowercased by the app before saving; this is the backstop.
CREATE UNIQUE INDEX "teams_name_ci_key" ON "teams"(lower("name"));
CREATE UNIQUE INDEX "users_email_ci_key" ON "users"(lower("email"));
CREATE UNIQUE INDEX "items_serial_ci_key"
    ON "items"(lower("serialNumber"))
    WHERE "serialNumber" IS NOT NULL;

-- 3. Emails are stored lowercase (the app lowercases; the DB enforces it).
ALTER TABLE "users"
    ADD CONSTRAINT "users_email_lowercase_ck" CHECK ("email" = lower("email"));

-- 4. Purchase date cannot be in the future.
ALTER TABLE "items"
    ADD CONSTRAINT "items_purchase_date_ck"
    CHECK ("purchaseDate" IS NULL OR "purchaseDate" <= CURRENT_DATE);

-- 5. assetTag is immutable once assigned ("never editable").
CREATE OR REPLACE FUNCTION "prevent_asset_tag_change"()
RETURNS trigger AS $$
BEGIN
    IF NEW."assetTag" IS DISTINCT FROM OLD."assetTag" THEN
        RAISE EXCEPTION 'assetTag is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "items_asset_tag_immutable"
    BEFORE UPDATE ON "items"
    FOR EACH ROW EXECUTE FUNCTION "prevent_asset_tag_change"();
