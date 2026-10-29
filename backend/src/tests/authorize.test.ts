import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import type { NextFunction } from "express";
import { authorize } from "../../src/middleware/authorize";
import { AuthenticationError, ForbiddenError } from "../../src/lib/errors";
import { Role } from "../../src/generated/enums";
import type { AuthenticatedUser } from "../../src/middleware/require-auth";

function makeReq(role?: Role): Request {
  const user: AuthenticatedUser | undefined = role
    ? {
        id: "00000000-0000-0000-0000-000000000001",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role,
        teamId: null,
        isActive: true,
        createdAt: new Date(),
        team: null,
      }
    : undefined;
  return { user } as unknown as Request;
}

function run(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  req: Request,
): Error | undefined {
  let caught: Error | undefined;
  middleware(req, {} as Response, (err?: unknown) => {
    if (err instanceof Error) caught = err;
  });
  return caught;
}

describe("authorize middleware", () => {
  describe("no user on request (requireAuth not applied)", () => {
    it("calls next with AuthenticationError", () => {
      const err = run(authorize(Role.EMPLOYEE), makeReq());
      assert.ok(err instanceof AuthenticationError);
    });
  });

  describe("EMPLOYEE role", () => {
    it("is allowed when minimum role is EMPLOYEE", () => {
      const err = run(authorize(Role.EMPLOYEE), makeReq(Role.EMPLOYEE));
      assert.equal(err, undefined);
    });

    it("is denied when minimum role is MANAGER", () => {
      const err = run(authorize(Role.MANAGER), makeReq(Role.EMPLOYEE));
      assert.ok(err instanceof ForbiddenError);
    });

    it("is denied when minimum role is ADMIN", () => {
      const err = run(authorize(Role.ADMIN), makeReq(Role.EMPLOYEE));
      assert.ok(err instanceof ForbiddenError);
    });
  });

  describe("MANAGER role", () => {
    it("is allowed when minimum role is EMPLOYEE", () => {
      const err = run(authorize(Role.EMPLOYEE), makeReq(Role.MANAGER));
      assert.equal(err, undefined);
    });

    it("is allowed when minimum role is MANAGER", () => {
      const err = run(authorize(Role.MANAGER), makeReq(Role.MANAGER));
      assert.equal(err, undefined);
    });

    it("is denied when minimum role is ADMIN", () => {
      const err = run(authorize(Role.ADMIN), makeReq(Role.MANAGER));
      assert.ok(err instanceof ForbiddenError);
    });
  });

  describe("ADMIN role", () => {
    it("is allowed when minimum role is EMPLOYEE", () => {
      const err = run(authorize(Role.EMPLOYEE), makeReq(Role.ADMIN));
      assert.equal(err, undefined);
    });

    it("is allowed when minimum role is MANAGER", () => {
      const err = run(authorize(Role.MANAGER), makeReq(Role.ADMIN));
      assert.equal(err, undefined);
    });

    it("is allowed when minimum role is ADMIN", () => {
      const err = run(authorize(Role.ADMIN), makeReq(Role.ADMIN));
      assert.equal(err, undefined);
    });
  });

  it("uses the lowest rank when multiple roles are passed", () => {
    const middleware = authorize(Role.ADMIN, Role.MANAGER);
    const err = run(middleware, makeReq(Role.MANAGER));
    assert.equal(err, undefined);
  });
});
