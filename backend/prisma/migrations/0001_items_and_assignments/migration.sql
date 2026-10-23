CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED');

CREATE SEQUENCE IF NOT EXISTS "item_asset_tag_seq" START WITH 1;


CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "assetTag" TEXT NOT NULL DEFAULT 'INV-' || lpad(nextval('item_asset_tag_seq')::text, 4, '0'),
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


CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assignedById" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "returnedById" UUID,
    "note" TEXT,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "items_assetTag_key" ON "items"("assetTag");

CREATE UNIQUE INDEX "items_serialNumber_key" ON "items"("serialNumber");

CREATE INDEX "items_status_idx" ON "items"("status");

CREATE INDEX "items_categoryId_idx" ON "items"("categoryId");


CREATE INDEX "assignments_itemId_idx" ON "assignments"("itemId");


CREATE INDEX "assignments_userId_idx" ON "assignments"("userId");


CREATE INDEX "users_teamId_idx" ON "users"("teamId");

CREATE INDEX "users_role_idx" ON "users"("role");


CREATE INDEX "users_isActive_idx" ON "users"("isActive");


ALTER TABLE "items" ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "assignments" ADD CONSTRAINT "assignments_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "assignments" ADD CONSTRAINT "assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "assignments" ADD CONSTRAINT "assignments_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "assignments_one_active_per_item"
    ON "assignments"("itemId")
    WHERE "returnedAt" IS NULL;

CREATE UNIQUE INDEX "teams_name_ci_key" ON "teams"(lower("name"));
CREATE UNIQUE INDEX "users_email_ci_key" ON "users"(lower("email"));
CREATE UNIQUE INDEX "items_serial_ci_key"
    ON "items"(lower("serialNumber"))
    WHERE "serialNumber" IS NOT NULL;

ALTER TABLE "users"
    ADD CONSTRAINT "users_email_lowercase_ck" CHECK ("email" = lower("email"));

ALTER TABLE "items"
    ADD CONSTRAINT "items_purchase_date_ck"
    CHECK ("purchaseDate" IS NULL OR "purchaseDate" <= CURRENT_DATE);

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
