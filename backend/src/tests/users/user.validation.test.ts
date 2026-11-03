import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../../lib/errors";
import { changePasswordSchema, updateUserSchema } from "../../validation/user.validation";
import { parseWith } from "../../middleware/validate-body";

function assertField(fn: () => unknown, field: string): void {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `Expected ValidationError, got ${String(err)}`);
    assert.ok(err.fields !== undefined && field in err.fields, `Expected error on "${field}"`);
    return true;
  });
}

describe("updateUserSchema", () => {
  const parse = (input: unknown) => parseWith(updateUserSchema, input);

  it("accepts a valid firstName update", () => {
    const result = parse({ firstName: "Michael" });
    assert.equal(result.firstName, "Michael");
  });

  it("accepts a valid lastName update", () => {
    const result = parse({ lastName: "Johnson" });
    assert.equal(result.lastName, "Johnson");
  });

  it("accepts updating both names", () => {
    const result = parse({
      firstName: "Michael",
      lastName: "Johnson",
    });

    assert.equal(result.firstName, "Michael");
    assert.equal(result.lastName, "Johnson");
  });

  it("trims firstName", () => {
    const result = parse({ firstName: "  Michael  " });
    assert.equal(result.firstName, "Michael");
  });

  it("trims lastName", () => {
    const result = parse({ lastName: "  Johnson  " });
    assert.equal(result.lastName, "Johnson");
  });

  it("rejects an empty update object", () => {
    assert.throws(() => parse({}), ValidationError);
  });

  it("rejects firstName containing only spaces", () => {
    assertField(() => parse({ firstName: "   " }), "firstName");
  });

  it("rejects lastName containing only spaces", () => {
    assertField(() => parse({ lastName: "   " }), "lastName");
  });

  it("rejects firstName shorter than 2 characters", () => {
    assertField(() => parse({ firstName: "A" }), "firstName");
  });

  it("rejects lastName shorter than 2 characters", () => {
    assertField(() => parse({ lastName: "J" }), "lastName");
  });

  it("rejects a non-string firstName", () => {
    assertField(() => parse({ firstName: 123 }), "firstName");
  });

  it("rejects a non-string lastName", () => {
    assertField(() => parse({ lastName: 123 }), "lastName");
  });

  it("rejects null firstName", () => {
    assertField(() => parse({ firstName: null }), "firstName");
  });

  it("rejects null lastName", () => {
    assertField(() => parse({ lastName: null }), "lastName");
  });
});

describe("changePasswordSchema", () => {
  const parse = (input: unknown) => parseWith(changePasswordSchema, input);

  const validPasswordChange = {
    oldPassword: "OldPassword123",
    newPassword: "NewPassword123",
  };

  it("accepts valid password change data", () => {
    const result = parse(validPasswordChange);

    assert.equal(result.oldPassword, "OldPassword123");
    assert.equal(result.newPassword, "NewPassword123");
  });

  it("rejects missing oldPassword", () => {
    const { oldPassword: _oldPassword, ...rest } = validPasswordChange;
    assertField(() => parse(rest), "oldPassword");
  });

  it("rejects missing newPassword", () => {
    const { newPassword: _newPassword, ...rest } = validPasswordChange;
    assertField(() => parse(rest), "newPassword");
  });

  it("rejects missing oldPassword when undefined", () => {
    assertField(() => parse({ ...validPasswordChange, oldPassword: undefined }), "oldPassword");
  });

  it("rejects missing newPassword when undefined", () => {
    assertField(() => parse({ ...validPasswordChange, newPassword: undefined }), "newPassword");
  });

  it("rejects a newPassword shorter than 8 characters", () => {
    assertField(() => parse({ ...validPasswordChange, newPassword: "New123" }), "newPassword");
  });

  it("rejects a newPassword longer than 64 characters", () => {
    assertField(
      () =>
        parse({
          ...validPasswordChange,
          newPassword: "Aa1" + "x".repeat(62),
        }),
      "newPassword",
    );
  });

  it("rejects a newPassword without an uppercase letter", () => {
    assertField(
      () => parse({ ...validPasswordChange, newPassword: "newpassword123" }),
      "newPassword",
    );
  });

  it("rejects a newPassword without a lowercase letter", () => {
    assertField(
      () => parse({ ...validPasswordChange, newPassword: "NEWPASSWORD123" }),
      "newPassword",
    );
  });

  it("rejects a newPassword without a digit", () => {
    assertField(() => parse({ ...validPasswordChange, newPassword: "NewPassword" }), "newPassword");
  });

  it("rejects when newPassword is the same as oldPassword", () => {
    assertField(
      () =>
        parse({
          oldPassword: "SamePassword123",
          newPassword: "SamePassword123",
        }),
      "newPassword",
    );
  });

  it("rejects a non-string oldPassword", () => {
    assertField(() => parse({ ...validPasswordChange, oldPassword: 123 }), "oldPassword");
  });

  it("rejects a non-string newPassword", () => {
    assertField(() => parse({ ...validPasswordChange, newPassword: 123 }), "newPassword");
  });

  it("rejects null oldPassword", () => {
    assertField(() => parse({ ...validPasswordChange, oldPassword: null }), "oldPassword");
  });

  it("rejects null newPassword", () => {
    assertField(() => parse({ ...validPasswordChange, newPassword: null }), "newPassword");
  });

  it("accepts an empty oldPassword because the schema only requires a string", () => {
    const result = parse({
      ...validPasswordChange,
      oldPassword: "",
    });

    assert.equal(result.oldPassword, "");
  });
});
