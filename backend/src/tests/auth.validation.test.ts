import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ValidationError } from "../lib/errors";
import { loginSchema, registerSchema, parseWith } from "../validation/auth.validation";

function assertField(fn: () => unknown, field: string): void {
  assert.throws(fn, (err: unknown) => {
    assert.ok(err instanceof ValidationError, `Expected ValidationError, got ${String(err)}`);
    assert.ok(err.fields !== undefined && field in err.fields, `Expected error on "${field}"`);
    return true;
  });
}

const validRegister = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  password: "Secret1234",
  confirmPassword: "Secret1234",
};

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = parseWith(loginSchema, { email: "user@example.com", password: "anypassword" });
    assert.equal(result.email, "user@example.com");
    assert.equal(result.password, "anypassword");
  });

  it("lowercases and trims email", () => {
    const result = parseWith(loginSchema, { email: "  User@Example.COM  ", password: "x" });
    assert.equal(result.email, "user@example.com");
  });

  it("rejects missing email", () => {
    assertField(() => parseWith(loginSchema, { password: "secret" }), "email");
  });

  it("rejects invalid email format", () => {
    assertField(() => parseWith(loginSchema, { email: "notanemail", password: "x" }), "email");
  });

  it("rejects email exceeding 254 characters", () => {
    const long = "a".repeat(249) + "@b.com";
    assert.equal(long.length, 255);
    assertField(() => parseWith(loginSchema, { email: long, password: "x" }), "email");
  });

  it("rejects empty password", () => {
    assertField(() => parseWith(loginSchema, { email: "u@e.com", password: "" }), "password");
  });

  it("rejects missing password", () => {
    assertField(() => parseWith(loginSchema, { email: "u@e.com" }), "password");
  });
});

describe("registerSchema", () => {
  const parse = (input: unknown) => parseWith(registerSchema, input);

  it("accepts valid registration data", () => {
    const result = parse(validRegister);
    assert.equal(result.firstName, "Ada");
    assert.equal(result.email, "ada@example.com");
  });

  it("lowercases email", () => {
    assert.equal(parse({ ...validRegister, email: "Ada@Example.COM" }).email, "ada@example.com");
  });

  it("accepts names with accented characters and hyphens", () => {
    assert.equal(parse({ ...validRegister, firstName: "Ančka-Đorić" }).firstName, "Ančka-Đorić");
  });

  it("rejects firstName shorter than 2 characters", () => {
    assertField(() => parse({ ...validRegister, firstName: "A" }), "firstName");
  });

  it("rejects firstName longer than 50 characters", () => {
    assertField(() => parse({ ...validRegister, firstName: "A".repeat(51) }), "firstName");
  });

  it("rejects firstName with digits", () => {
    assertField(() => parse({ ...validRegister, firstName: "Ada1" }), "firstName");
  });

  it("rejects firstName of only spaces (trimmed to empty)", () => {
    assertField(() => parse({ ...validRegister, firstName: "   " }), "firstName");
  });

  it("rejects lastName shorter than 2 characters", () => {
    assertField(() => parse({ ...validRegister, lastName: "L" }), "lastName");
  });

  it("rejects missing email", () => {
    const { email: _email, ...rest } = validRegister;
    assertField(() => parse(rest), "email");
  });

  it("rejects password shorter than 8 characters", () => {
    assertField(
      () => parse({ ...validRegister, password: "Ab1", confirmPassword: "Ab1" }),
      "password",
    );
  });

  it("rejects password longer than 64 characters", () => {
    const long = "Aa1" + "x".repeat(62);
    assertField(
      () => parse({ ...validRegister, password: long, confirmPassword: long }),
      "password",
    );
  });

  it("rejects password without uppercase letter", () => {
    const pw = "secret123";
    assertField(() => parse({ ...validRegister, password: pw, confirmPassword: pw }), "password");
  });

  it("rejects password without lowercase letter", () => {
    const pw = "SECRET123";
    assertField(() => parse({ ...validRegister, password: pw, confirmPassword: pw }), "password");
  });

  it("rejects password without digit", () => {
    const pw = "SecretPass";
    assertField(() => parse({ ...validRegister, password: pw, confirmPassword: pw }), "password");
  });

  it("rejects mismatched confirmPassword", () => {
    assertField(
      () => parse({ ...validRegister, confirmPassword: "Different1" }),
      "confirmPassword",
    );
  });

  it("ignores a role field sent by the client", () => {
    const result = parse({ ...validRegister, role: "ADMIN" });
    assert.equal("role" in result, false);
  });
});
