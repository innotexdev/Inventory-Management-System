import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { registerSchema, loginSchema } from "../lib/validation";

function fieldErrors<T extends z.ZodType>(schema: T, values: unknown): Record<string, string> {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= issue.message;
  }
  return fields;
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
    const result = loginSchema.safeParse({ email: "user@example.com", password: "anypassword" });
    assert.ok(result.success);
  });

  it("lowercases and trims email", () => {
    const result = loginSchema.safeParse({ email: "  User@Example.COM  ", password: "x" });
    assert.ok(result.success);
    assert.equal(result.data?.email, "user@example.com");
  });

  it("rejects missing email", () => {
    const errs = fieldErrors(loginSchema, { password: "secret" });
    assert.ok("email" in errs);
  });

  it("rejects invalid email format", () => {
    const errs = fieldErrors(loginSchema, { email: "notanemail", password: "x" });
    assert.ok("email" in errs);
  });

  it("rejects email exceeding 254 characters", () => {
    const long = "a".repeat(249) + "@b.com";
    assert.equal(long.length, 255);
    const errs = fieldErrors(loginSchema, { email: long, password: "x" });
    assert.ok("email" in errs);
  });

  it("rejects empty password", () => {
    const errs = fieldErrors(loginSchema, { email: "u@e.com", password: "" });
    assert.ok("password" in errs);
  });

  it("rejects missing password", () => {
    const errs = fieldErrors(loginSchema, { email: "u@e.com" });
    assert.ok("password" in errs);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validRegister);
    assert.ok(result.success);
  });

  it("lowercases email", () => {
    const result = registerSchema.safeParse({ ...validRegister, email: "Ada@Example.COM" });
    assert.ok(result.success);
    assert.equal(result.data?.email, "ada@example.com");
  });

  it("accepts names with accented characters and hyphens", () => {
    const result = registerSchema.safeParse({ ...validRegister, firstName: "Ančka-Đorić" });
    assert.ok(result.success);
  });

  it("rejects firstName shorter than 2 characters", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, firstName: "A" });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName longer than 50 characters", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, firstName: "A".repeat(51) });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName with digits", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, firstName: "Ada1" });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName of only spaces", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, firstName: "   " });
    assert.ok("firstName" in errs);
  });

  it("rejects lastName shorter than 2 characters", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, lastName: "L" });
    assert.ok("lastName" in errs);
  });

  it("rejects missing email", () => {
    const { firstName, lastName, password, confirmPassword } = validRegister;
    const errs = fieldErrors(registerSchema, { firstName, lastName, password, confirmPassword });
    assert.ok("email" in errs);
  });

  it("rejects password shorter than 8 characters", () => {
    const errs = fieldErrors(registerSchema, {
      ...validRegister,
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    assert.ok("password" in errs);
  });

  it("rejects password longer than 64 characters", () => {
    const long = "Aa1" + "x".repeat(62);
    const errs = fieldErrors(registerSchema, {
      ...validRegister,
      password: long,
      confirmPassword: long,
    });
    assert.ok("password" in errs);
  });

  it("rejects password without uppercase letter", () => {
    const errs = fieldErrors(registerSchema, {
      ...validRegister,
      password: "secret123",
      confirmPassword: "secret123",
    });
    assert.ok("password" in errs);
  });

  it("rejects password without lowercase letter", () => {
    const errs = fieldErrors(registerSchema, {
      ...validRegister,
      password: "SECRET123",
      confirmPassword: "SECRET123",
    });
    assert.ok("password" in errs);
  });

  it("rejects password without digit", () => {
    const errs = fieldErrors(registerSchema, {
      ...validRegister,
      password: "SecretPass",
      confirmPassword: "SecretPass",
    });
    assert.ok("password" in errs);
  });

  it("rejects mismatched confirmPassword", () => {
    const errs = fieldErrors(registerSchema, { ...validRegister, confirmPassword: "Different1" });
    assert.ok("confirmPassword" in errs);
  });
});
