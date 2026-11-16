import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../../lib/errors";
import { parseWith } from "../../middleware/validate-body";
import {
  changeItemStatusSchema,
  createItemSchema,
  itemQuerySchema,
  updateItemSchema,
} from "../../validation/inventory.validation";

function assertField(fn: () => unknown, field: string): void {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `Expected ValidationError, got ${String(err)}`);
    assert.ok(err.fields !== undefined && field in err.fields, `Expected error on "${field}"`);
    return true;
  });
}

const CATEGORY_ID = "11111111-1111-4111-8111-111111111111";

describe("createItemSchema", () => {
  const parse = (input: unknown) => parseWith(createItemSchema, input);
  const valid = { name: "MacBook Pro 14", categoryId: CATEGORY_ID };

  it("accepts the required fields", () => {
    const result = parse(valid);
    assert.equal(result.name, "MacBook Pro 14");
    assert.equal(result.categoryId, CATEGORY_ID);
  });

  it("accepts all optional fields", () => {
    const result = parse({
      ...valid,
      brand: "Apple",
      model: "M4 Pro",
      serialNumber: "SN-ABC-123",
      purchaseDate: "2025-01-15",
      notes: "New laptop",
    });

    assert.equal(result.brand, "Apple");
    assert.equal(result.model, "M4 Pro");
    assert.equal(result.serialNumber, "SN-ABC-123");
    assert.equal(result.purchaseDate?.toISOString(), "2025-01-15T00:00:00.000Z");
    assert.equal(result.notes, "New laptop");
  });

  it("trims name and optional text", () => {
    const result = parse({ ...valid, name: "  ThinkPad  ", brand: "  Lenovo  " });
    assert.equal(result.name, "ThinkPad");
    assert.equal(result.brand, "Lenovo");
  });

  it("rejects a name shorter than 2 characters", () => {
    assertField(() => parse({ ...valid, name: "A" }), "name");
  });

  it("rejects a name longer than 100 characters", () => {
    assertField(() => parse({ ...valid, name: "a".repeat(101) }), "name");
  });

  it("rejects a name of only spaces", () => {
    assertField(() => parse({ ...valid, name: "   " }), "name");
  });

  it("rejects a missing categoryId", () => {
    assertField(() => parse({ name: "Mouse" }), "categoryId");
  });

  it("rejects a malformed categoryId", () => {
    assertField(() => parse({ ...valid, categoryId: "not-a-uuid" }), "categoryId");
  });

  it("rejects a brand longer than 50 characters", () => {
    assertField(() => parse({ ...valid, brand: "a".repeat(51) }), "brand");
  });

  it("rejects a model longer than 50 characters", () => {
    assertField(() => parse({ ...valid, model: "a".repeat(51) }), "model");
  });

  it("rejects a serial number shorter than 3 characters", () => {
    assertField(() => parse({ ...valid, serialNumber: "AB" }), "serialNumber");
  });

  it("rejects a serial number longer than 64 characters", () => {
    assertField(() => parse({ ...valid, serialNumber: "a".repeat(65) }), "serialNumber");
  });

  it("rejects a serial number with invalid characters", () => {
    assertField(() => parse({ ...valid, serialNumber: "SN/123" }), "serialNumber");
  });

  it("accepts a serial number with hyphens", () => {
    assert.equal(parse({ ...valid, serialNumber: "SN-123-A" }).serialNumber, "SN-123-A");
  });

  it("turns an empty serial number into null", () => {
    assert.equal(parse({ ...valid, serialNumber: "   " }).serialNumber, null);
  });

  it("rejects a purchase date in the future", () => {
    assertField(() => parse({ ...valid, purchaseDate: "2099-01-01" }), "purchaseDate");
  });

  it("rejects an invalid purchase date", () => {
    assertField(() => parse({ ...valid, purchaseDate: "2025-13-45" }), "purchaseDate");
  });

  it("turns an empty purchase date into null", () => {
    assert.equal(parse({ ...valid, purchaseDate: "" }).purchaseDate, null);
  });

  it("rejects notes longer than 500 characters", () => {
    assertField(() => parse({ ...valid, notes: "a".repeat(501) }), "notes");
  });

  it("ignores unknown fields", () => {
    const result = parse({ ...valid, status: "RETIRED", assetTag: "INV-9999" });
    assert.ok(!("status" in result));
    assert.ok(!("assetTag" in result));
  });
});

describe("updateItemSchema", () => {
  const parse = (input: unknown) => parseWith(updateItemSchema, input);

  it("accepts a partial update", () => {
    assert.equal(parse({ name: "New name" }).name, "New name");
  });

  it("rejects an empty update", () => {
    assert.throws(() => parse({}), ValidationError);
  });

  it("ignores status and asset tag", () => {
    const result = parse({ name: "New name", status: "RETIRED", assetTag: "INV-9999" });
    assert.ok(!("status" in result));
    assert.ok(!("assetTag" in result));
  });
});

describe("changeItemStatusSchema", () => {
  const parse = (input: unknown) => parseWith(changeItemStatusSchema, input);

  it("accepts AVAILABLE, IN_REPAIR and RETIRED", () => {
    assert.equal(parse({ status: "AVAILABLE" }).status, "AVAILABLE");
    assert.equal(parse({ status: "IN_REPAIR" }).status, "IN_REPAIR");
    assert.equal(parse({ status: "RETIRED" }).status, "RETIRED");
  });

  it("rejects ASSIGNED", () => {
    assertField(() => parse({ status: "ASSIGNED" }), "status");
  });

  it("rejects a missing status", () => {
    assertField(() => parse({}), "status");
  });
});

describe("itemQuerySchema", () => {
  const parse = (input: unknown) => parseWith(itemQuerySchema, input);

  it("uses default pagination", () => {
    const result = parse({});
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 20);
  });

  it("accepts valid pagination", () => {
    const result = parse({ page: "3", pageSize: "50" });
    assert.equal(result.page, 3);
    assert.equal(result.pageSize, 50);
  });

  it("falls back for invalid page values", () => {
    assert.equal(parse({ page: "0" }).page, 1);
    assert.equal(parse({ page: "abc" }).page, 1);
    assert.equal(parse({ page: "-2" }).page, 1);
  });

  it("falls back for invalid pageSize values", () => {
    assert.equal(parse({ pageSize: "0" }).pageSize, 20);
    assert.equal(parse({ pageSize: "101" }).pageSize, 20);
    assert.equal(parse({ pageSize: "abc" }).pageSize, 20);
  });

  it("accepts all filters and sorting", () => {
    const result = parse({
      search: " macbook ",
      status: "ASSIGNED",
      categoryId: CATEGORY_ID,
      teamId: CATEGORY_ID,
      holderId: CATEGORY_ID,
      sort: "assetTag",
      order: "desc",
    });

    assert.equal(result.search, "macbook");
    assert.equal(result.status, "ASSIGNED");
    assert.equal(result.sort, "assetTag");
    assert.equal(result.order, "desc");
  });

  it("ignores invalid enum and uuid filters", () => {
    const result = parse({ status: "UNKNOWN", sort: "price", categoryId: "bad" });
    assert.equal(result.status, undefined);
    assert.equal(result.sort, undefined);
    assert.equal(result.categoryId, undefined);
  });
});
