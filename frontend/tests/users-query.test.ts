import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildUsersHref,
  hasActiveConstraints,
  parseUsersQuery,
  toApiSearchParams,
} from "../lib/users-query";

const TEAM_ID = "5a9d1c40-0a0e-4f0b-8b1a-2c3d4e5f6a7b";

describe("parseUsersQuery", () => {
  it("applies defaults for an empty query", () => {
    const query = parseUsersQuery({});
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 20);
    assert.equal(query.role, undefined);
    assert.equal(query.isActive, undefined);
  });

  it("keeps valid filters and pagination", () => {
    const query = parseUsersQuery({
      search: "  finn  ",
      role: "EMPLOYEE",
      teamId: TEAM_ID,
      isActive: "false",
      page: "3",
      pageSize: "50",
    });
    assert.equal(query.search, "finn");
    assert.equal(query.role, "EMPLOYEE");
    assert.equal(query.teamId, TEAM_ID);
    assert.equal(query.isActive, false);
    assert.equal(query.page, 3);
    assert.equal(query.pageSize, 50);
  });

  it("falls back to defaults for invalid values", () => {
    const query = parseUsersQuery({
      role: "OWNER",
      teamId: "not-a-uuid",
      isActive: "maybe",
      page: "abc",
      pageSize: "500",
    });
    assert.equal(query.role, undefined);
    assert.equal(query.teamId, undefined);
    assert.equal(query.isActive, undefined);
    assert.equal(query.page, 1);
    assert.equal(query.pageSize, 20);
  });
});

describe("toApiSearchParams", () => {
  it("sends pagination and only the active filters", () => {
    const query = parseUsersQuery({ role: "MANAGER", isActive: "true", page: "2" });
    const params = toApiSearchParams(query);
    assert.equal(params.get("role"), "MANAGER");
    assert.equal(params.get("isActive"), "true");
    assert.equal(params.get("page"), "2");
    assert.equal(params.get("pageSize"), "20");
    assert.equal(params.has("search"), false);
  });
});

describe("buildUsersHref", () => {
  it("applies a filter change and resets the page", () => {
    const href = buildUsersHref(new URLSearchParams("role=MANAGER&page=4"), {
      teamId: TEAM_ID,
    });
    const params = new URLSearchParams(href.split("?")[1]);
    assert.equal(params.get("role"), "MANAGER");
    assert.equal(params.get("teamId"), TEAM_ID);
    assert.equal(params.has("page"), false);
  });

  it("keeps the page when only the page changes", () => {
    const href = buildUsersHref(new URLSearchParams("role=MANAGER&page=4"), { page: "5" });
    const params = new URLSearchParams(href.split("?")[1]);
    assert.equal(params.get("page"), "5");
    assert.equal(params.get("role"), "MANAGER");
  });

  it("removes a filter when its change is undefined", () => {
    const href = buildUsersHref(new URLSearchParams("role=MANAGER&page=4"), {
      role: undefined,
    });
    const params = new URLSearchParams(href.split("?")[1]);
    assert.equal(params.has("role"), false);
    assert.equal(params.has("page"), false);
  });
});

describe("hasActiveConstraints", () => {
  it("detects applied filters", () => {
    assert.equal(hasActiveConstraints(new URLSearchParams("role=ADMIN")), true);
    assert.equal(hasActiveConstraints(new URLSearchParams("search=ada")), true);
  });

  it("returns false for an empty query string", () => {
    assert.equal(hasActiveConstraints(new URLSearchParams("")), false);
  });
});
