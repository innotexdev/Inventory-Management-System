import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildInventoryHref,
  hasActiveConstraints,
  parseInventoryQuery,
  toApiSearchParams,
} from "../lib/inventory-query";

describe("parseInventoryQuery", () => {
  it("applies defaults for an empty query", () => {
    const query = parseInventoryQuery({});
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 20);
    assert.equal(query.status, undefined);
    assert.equal(query.sort, undefined);
    assert.equal(query.order, undefined);
  });

  it("keeps valid filters, sort and pagination", () => {
    const query = parseInventoryQuery({
      search: "  MacBook  ",
      status: "AVAILABLE",
      categoryId: "5a9d1c40-0a0e-4f0b-8b1a-2c3d4e5f6a7b",
      sort: "createdAt",
      order: "desc",
      page: "3",
      pageSize: "50",
    });
    assert.equal(query.search, "MacBook");
    assert.equal(query.status, "AVAILABLE");
    assert.equal(query.sort, "createdAt");
    assert.equal(query.order, "desc");
    assert.equal(query.page, 3);
    assert.equal(query.pageSize, 50);
  });

  it("falls back to defaults for invalid values", () => {
    const query = parseInventoryQuery({
      status: "UNKNOWN",
      categoryId: "not-a-uuid",
      sort: "holder",
      order: "sideways",
      page: "abc",
      pageSize: "500",
    });
    assert.equal(query.status, undefined);
    assert.equal(query.categoryId, undefined);
    assert.equal(query.sort, undefined);
    assert.equal(query.order, undefined);
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 20);
  });

  it("uses the first value of a repeated parameter", () => {
    const query = parseInventoryQuery({ search: ["first", "second"] });
    assert.equal(query.search, "first");
  });
});

describe("toApiSearchParams", () => {
  it("sends pagination and only the active filters", () => {
    const query = parseInventoryQuery({ status: "AVAILABLE", page: "2" });
    const params = toApiSearchParams(query);
    assert.equal(params.get("status"), "AVAILABLE");
    assert.equal(params.get("page"), "2");
    assert.equal(params.get("pageSize"), "20");
    assert.equal(params.has("search"), false);
    assert.equal(params.has("sort"), false);
  });
});

describe("buildInventoryHref", () => {
  it("applies a filter change and resets the page", () => {
    const href = buildInventoryHref(new URLSearchParams("status=ASSIGNED&page=4"), {
      categoryId: "5a9d1c40-0a0e-4f0b-8b1a-2c3d4e5f6a7b",
    });
    const params = new URLSearchParams(href.split("?")[1]);
    assert.equal(params.get("status"), "ASSIGNED");
    assert.equal(params.get("categoryId"), "5a9d1c40-0a0e-4f0b-8b1a-2c3d4e5f6a7b");
    assert.equal(params.has("page"), false);
  });

  it("keeps filters when only the page changes", () => {
    const href = buildInventoryHref(new URLSearchParams("status=ASSIGNED&page=4"), { page: "5" });
    const params = new URLSearchParams(href.split("?")[1]);
    assert.equal(params.get("status"), "ASSIGNED");
    assert.equal(params.get("page"), "5");
  });

  it("removes a parameter when its value is undefined", () => {
    const href = buildInventoryHref(new URLSearchParams("status=AVAILABLE"), {
      status: undefined,
    });
    assert.equal(href, "/inventory");
  });
});

describe("hasActiveConstraints", () => {
  it("detects an empty query", () => {
    assert.equal(hasActiveConstraints(new URLSearchParams()), false);
  });

  it("detects a filter or page", () => {
    assert.equal(hasActiveConstraints(new URLSearchParams("status=AVAILABLE")), true);
    assert.equal(hasActiveConstraints(new URLSearchParams("page=2")), true);
  });
});
