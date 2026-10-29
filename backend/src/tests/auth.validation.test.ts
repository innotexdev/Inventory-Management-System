import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLoginInput, parseRegisterInput } from "../../src/validation/auth.validation";
import { ValidationError } from "../../src/lib/errors";

function assertField(fn: () => unknown, field: string) {
  try {
    fn();
    assert.fail("Expected ValidationError");
  } catch (err) {
    assert.ok(err instanceof ValidationError, `Expected ValidationError, got ${String(err)}`);
    assert.ok(
      err.fields !== undefined && field in err.fields,
      `Expected field "${field}" in errors, got: ${JSON.stringify(err.fields)}`,
    );
  }
}

describe("parseLoginInput", () => {
  it("accepts valid credentials", () => {
    const result = parseLoginInput({ email: "user@example.com", password: "secret" });
    assert.equal(result.email, "user@example.com");
    assert.equal(result.password, "secret");
  });

  it("lowercases and trims email", () => {
    const result = parseLoginInput({ email: "  User@Example.COM  ", password: "x" });
    assert.equal(result.email, "user@example.com");
  });

  it("rejects missing email", () => {
    assertField(() => parseLoginInput({ password: "secret" }), "email");
  });

  it("rejects invalid email format", () => {
    assertField(() => parseLoginInput({ email: "notanemail", password: "x" }), "email");
  });

  it("rejects email exceeding 254 characters", () => {
    const long = "a".repeat(249) + "@b.com";
    assertField(() => parseLoginInput({ email: long, password: "x" }), "email");
  });

  it("rejects empty password", () => {
    assertField(() => parseLoginInput({ email: "u@e.com", password: "" }), "password");
  });

  it("rejects missing password", () => {
    assertField(() => parseLoginInput({ email: "u@e.com" }), "password");
  });
});

describe("parseRegisterInput", () => {
  const valid = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password: "Secret1234",
    confirmPassword: "Secret1234",
  };

  it("accepts valid registration data", () => {
    const result = parseRegisterInput(valid);
    assert.equal(result.firstName, "Ada");
    assert.equal(result.email, "ada@example.com");
  });

  it("lowercases email", () => {
    const result = parseRegisterInput({ ...valid, email: "Ada@Example.COM" });
    assert.equal(result.email, "ada@example.com");
  });

  it("accepts names with accented characters and hyphens", () => {
    const result = parseRegisterInput({ ...valid, firstName: "Ančka-Đorić" });
    assert.equal(result.firstName, "Ančka-Đorić");
  });

  it("rejects firstName shorter than 2 characters", () => {
    assertField(() => parseRegisterInput({ ...valid, firstName: "A" }), "firstName");
  });

  it("rejects firstName longer than 50 characters", () => {
    assertField(() => parseRegisterInput({ ...valid, firstName: "A".repeat(51) }), "firstName");
  });

  it("rejects firstName with digits", () => {
    assertField(() => parseRegisterInput({ ...valid, firstName: "Ada1" }), "firstName");
  });

  it("rejects firstName of only spaces (trimmed to empty)", () => {
    assertField(() => parseRegisterInput({ ...valid, firstName: "   " }), "firstName");
  });

  it("rejects lastName shorter than 2 characters", () => {
    assertField(() => parseRegisterInput({ ...valid, lastName: "L" }), "lastName");
  });

  it("rejects missing email", () => {
    const { email: _email, ...rest } = valid;
    assertField(() => parseRegisterInput(rest), "email");
  });

  it("rejects password shorter than 8 characters", () => {
    assertField(() => parseRegisterInput({ ...valid, password: "Ab1", confirmPassword: "Ab1" }), "password");
  });

  it("rejects password longer than 64 characters", () => {
    const long = "Aa1" + "x".repeat(62);
    assertField(() => parseRegisterInput({ ...valid, password: long, confirmPassword: long }), "password");
  });

  it("rejects password without uppercase letter", () => {
    assertField(
      () => parseRegisterInput({ ...valid, password: "secret123", confirmPassword: "secret123" }),
      "password",
    );
  });

  it("rejects password without lowercase letter", () => {
    assertField(
      () => parseRegisterInput({ ...valid, password: "SECRET123", confirmPassword: "SECRET123" }),
      "password",
    );
  });

  it("rejects password without digit", () => {
    assertField(
      () => parseRegisterInput({ ...valid, password: "SecretPass", confirmPassword: "SecretPass" }),
      "password",
    );
  });

  it("rejects mismatched confirmPassword", () => {
    assertField(
      () => parseRegisterInput({ ...valid, confirmPassword: "Different1" }),
      "confirmPassword",
    );
  });

  it("ignores a role field sent by the client", () => {
    const result = parseRegisterInput({ ...valid, role: "ADMIN" });
    assert.ok(!("role" in result));
  });
});
