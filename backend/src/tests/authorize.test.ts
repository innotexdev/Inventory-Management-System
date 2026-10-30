import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { authorize, hasMinRole } from "../middleware/authorize";
import { AuthenticationError, ForbiddenError } from "../lib/errors";
import { Role } from "../generated/enums";
import type { AuthenticatedRequest, AuthenticatedUser } from "../middleware/require-auth";

function makeUser(role: Role): AuthenticatedUser {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    role,
    teamId: null,
    isActive: true,
    createdAt: new Date(),
    team: null,
  };
}

function run(req: Partial<AuthenticatedRequest>, minimumRole: Role): unknown {
  let result: unknown;
  authorize(minimumRole)(req as Request, {} as Response, (err?: unknown) => {
    result = err;
  });
  return result;
}

describe("hasMinRole", () => {
  const cases: Array<[Role, Role, boolean]> = [
    // [user role, minimum role, expected]
    [Role.EMPLOYEE, Role.EMPLOYEE, true],
    [Role.EMPLOYEE, Role.MANAGER, false],
    [Role.EMPLOYEE, Role.ADMIN, false],
    [Role.MANAGER, Role.EMPLOYEE, true],
    [Role.MANAGER, Role.MANAGER, true],
    [Role.MANAGER, Role.ADMIN, false],
    [Role.ADMIN, Role.EMPLOYEE, true],
    [Role.ADMIN, Role.MANAGER, true],
    [Role.ADMIN, Role.ADMIN, true],
  ];

  for (const [userRole, minRole, expected] of cases) {
    it(`${userRole} vs minimum ${minRole} -> ${expected ? "allowed" : "denied"}`, () => {
      assert.equal(hasMinRole(userRole, minRole), expected);
    });
  }
});

describe("authorize middleware", () => {
  it("calls next with AuthenticationError when there is no user", () => {
    assert.ok(run({}, Role.EMPLOYEE) instanceof AuthenticationError);
  });

  it("calls next with ForbiddenError when the role is too low", () => {
    const err = run({ user: makeUser(Role.EMPLOYEE) }, Role.MANAGER);
    assert.ok(err instanceof ForbiddenError);
  });

  it("calls next with no error when the role is sufficient", () => {
    assert.equal(run({ user: makeUser(Role.MANAGER) }, Role.MANAGER), undefined);
  });
});
