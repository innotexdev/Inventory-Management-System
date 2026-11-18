import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../../lib/errors";
import { parseWith } from "../../middleware/validate-body";
import { adminUpdateUserSchema } from "../../validation/user.validation";
import { createTeamSchema, updateTeamSchema } from "../../validation/team.validation";

function assertField(fn: () => unknown, field: string): void {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError);
    assert.ok(err.fields !== undefined && field in err.fields);
    return true;
  });
}

describe("adminUpdateUserSchema", () => {
  it("accepts role, team and active status updates", () => {
    const result = parseWith(adminUpdateUserSchema, {
      role: "MANAGER",
      teamId: "550e8400-e29b-41d4-a716-446655440000",
      isActive: false,
    });
    assert.equal(result.role, "MANAGER");
    assert.equal(result.isActive, false);
  });

  it("accepts removal from a team", () => {
    const result = parseWith(adminUpdateUserSchema, { teamId: null });
    assert.equal(result.teamId, null);
  });

  it("rejects an invalid role", () => {
    assertField(() => parseWith(adminUpdateUserSchema, { role: "OWNER" }), "role");
  });

  it("rejects an empty update", () => {
    assertField(() => parseWith(adminUpdateUserSchema, {}), "form");
  });
});

describe("team schemas", () => {
  it("trims and accepts a valid team", () => {
    const result = parseWith(createTeamSchema, {
      name: "  Engineering  ",
      description: "  Build systems  ",
    });
    assert.equal(result.name, "Engineering");
    assert.equal(result.description, "Build systems");
  });

  it("rejects a short team name", () => {
    assertField(() => parseWith(createTeamSchema, { name: " " }), "name");
  });

  it("rejects a description longer than 250 characters", () => {
    assertField(() => parseWith(updateTeamSchema, { description: "x".repeat(251) }), "description");
  });
});
