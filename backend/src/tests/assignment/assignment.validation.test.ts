import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../../lib/errors";
import { parseWith } from "../../middleware/validate-body";
import { assignSchema, unassignSchema } from "../../validation/assignment.validation";
import { userQuerySchema } from "../../validation/user.validation";

function assertField(fn: () => unknown, field: string): void {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `Expected ValidationError, got ${String(err)}`);
    assert.ok(err.fields !== undefined && field in err.fields, `Expected error on "${field}"`);
    return true;
  });
}

const USER_ID = "22222222-2222-4222-8222-222222222222";

describe("assignSchema", () => {
  const parse = (input: unknown) => parseWith(assignSchema, input);

  it("accepts a user id with no note", () => {
    const result = parse({ userId: USER_ID });
    assert.equal(result.userId, USER_ID);
    assert.equal(result.note, undefined);
  });

  it("trims and keeps a note", () => {
    const result = parse({ userId: USER_ID, note: "  Frontend laptop  " });
    assert.equal(result.note, "Frontend laptop");
  });

  it("rejects a missing or malformed user id", () => {
    assertField(() => parse({}), "userId");
    assertField(() => parse({ userId: "nope" }), "userId");
  });

  it("rejects a note longer than 250 characters", () => {
    assertField(() => parse({ userId: USER_ID, note: "a".repeat(251) }), "note");
  });

  it("turns a whitespace-only note into null", () => {
    const result = parse({ userId: USER_ID, note: "   " });
    assert.equal(result.note, null);
  });
});

describe("unassignSchema", () => {
  const parse = (input: unknown) => parseWith(unassignSchema, input);

  it("accepts an empty body", () => {
    const result = parse({});
    assert.equal(result.note, undefined);
  });

  it("accepts undefined as an empty body", () => {
    const result = parse(undefined);
    assert.equal(result.note, undefined);
  });

  it("trims and keeps a note", () => {
    const result = parse({ note: "  Returned to stock  " });
    assert.equal(result.note, "Returned to stock");
  });

  it("rejects a note longer than 250 characters", () => {
    assertField(() => parse({ note: "a".repeat(251) }), "note");
  });
});

describe("userQuerySchema", () => {
  const parse = (input: unknown) => parseWith(userQuerySchema, input);

  it("applies pagination defaults", () => {
    const result = parse({});
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 20);
  });

  it("falls back to defaults for invalid pagination", () => {
    const result = parse({ page: "0", pageSize: "1000" });
    assert.equal(result.page, 1);
    assert.equal(result.pageSize, 20);
  });

  it("parses isActive booleans from strings", () => {
    assert.equal(parse({ isActive: "true" }).isActive, true);
    assert.equal(parse({ isActive: "false" }).isActive, false);
    assert.equal(parse({ isActive: "maybe" }).isActive, undefined);
  });

  it("accepts a valid role and ignores an invalid role", () => {
    assert.equal(parse({ role: "MANAGER" }).role, "MANAGER");
    assert.equal(parse({ role: "OWNER" }).role, undefined);
  });

  it("trims search text", () => {
    assert.equal(parse({ search: "  ada  " }).search, "ada");
  });

  it("ignores a malformed team id", () => {
    assert.equal(parse({ teamId: "nope" }).teamId, undefined);
  });
});
