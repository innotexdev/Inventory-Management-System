-- AlterTable
ALTER TABLE "items" ALTER COLUMN "assetTag" SET DEFAULT 'INV-' || lpad(nextval('item_asset_tag_seq')::text, 4, '0');
