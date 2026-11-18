import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  itemSchema,
  itemStatusSchema,
  assignSchema,
  unassignSchema,
  teamSchema,
} from "../lib/validation";
import { isSafeNextPath } from "../lib/safe-path";

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

describe("isSafeNextPath", () => {
  it("accepts safe internal paths", () => {
    assert.equal(isSafeNextPath("/my-inventory"), true);
    assert.equal(isSafeNextPath("/dashboard"), true);
    assert.equal(isSafeNextPath("/profile"), true);
    assert.equal(isSafeNextPath("/inventory?page=2"), true);
  });

  it("rejects protocol-relative URLs", () => {
    assert.equal(isSafeNextPath("//evil.com"), false);
    assert.equal(isSafeNextPath("///evil.com"), false);
  });

  it("rejects backslashes in paths", () => {
    assert.equal(isSafeNextPath("/\\evil.com"), false);
  });

  it("rejects paths containing control characters", () => {
    assert.equal(isSafeNextPath("/\t/evil.com"), false);
    assert.equal(isSafeNextPath("/\n/evil.com"), false);
  });

  it("rejects external URLs", () => {
    assert.equal(isSafeNextPath("https://evil.com"), false);
    assert.equal(isSafeNextPath("http://evil.com"), false);
  });

  it("rejects JavaScript URLs", () => {
    assert.equal(isSafeNextPath("javascript:alert(1)"), false);
  });

  it("rejects paths that do not start with a slash", () => {
    assert.equal(isSafeNextPath("my-inventory"), false);
  });

  it("rejects empty strings", () => {
    assert.equal(isSafeNextPath(""), false);
  });

  it("rejects non-string values", () => {
    assert.equal(isSafeNextPath(null), false);
    assert.equal(isSafeNextPath(undefined), false);
    assert.equal(isSafeNextPath(123), false);
  });
});

describe("updateProfileSchema", () => {
  const validProfile = { firstName: "Ada", lastName: "Lovelace" };

  it("accepts valid names", () => {
    const result = updateProfileSchema.safeParse(validProfile);
    assert.ok(result.success);
  });

  it("accepts names with accented characters, hyphens and apostrophes", () => {
    const result = updateProfileSchema.safeParse({
      firstName: "Ančka-Đorić",
      lastName: "O'Malley",
    });
    assert.ok(result.success);
  });

  it("trims surrounding spaces", () => {
    const result = updateProfileSchema.safeParse({
      firstName: "  Ada  ",
      lastName: "  Lovelace  ",
    });
    assert.ok(result.success);
    assert.equal(result.data?.firstName, "Ada");
    assert.equal(result.data?.lastName, "Lovelace");
  });

  it("rejects firstName shorter than 2 characters", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, firstName: "A" });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName longer than 50 characters", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, firstName: "A".repeat(51) });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName of only spaces", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, firstName: "   " });
    assert.ok("firstName" in errs);
  });

  it("rejects firstName with digits", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, firstName: "Ada1" });
    assert.ok("firstName" in errs);
  });

  it("rejects lastName shorter than 2 characters", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, lastName: "L" });
    assert.ok("lastName" in errs);
  });

  it("rejects lastName longer than 50 characters", () => {
    const errs = fieldErrors(updateProfileSchema, { ...validProfile, lastName: "L".repeat(51) });
    assert.ok("lastName" in errs);
  });

  it("rejects missing lastName", () => {
    const errs = fieldErrors(updateProfileSchema, { firstName: "Ada" });
    assert.ok("lastName" in errs);
  });
});

describe("changePasswordSchema", () => {
  const validPasswordChange = {
    currentPassword: "OldSecret1",
    newPassword: "NewSecret1",
    confirmPassword: "NewSecret1",
  };

  it("accepts a valid password change", () => {
    const result = changePasswordSchema.safeParse(validPasswordChange);
    assert.ok(result.success);
  });

  it("rejects an empty current password", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      currentPassword: "",
    });
    assert.ok("currentPassword" in errs);
  });

  it("rejects a missing current password", () => {
    const { currentPassword: _currentPassword, ...rest } = validPasswordChange;
    const errs = fieldErrors(changePasswordSchema, rest);
    assert.ok("currentPassword" in errs);
  });

  it("rejects a new password shorter than 8 characters", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      newPassword: "Ab1",
      confirmPassword: "Ab1",
    });
    assert.ok("newPassword" in errs);
  });

  it("rejects a new password longer than 64 characters", () => {
    const long = "Aa1" + "x".repeat(62);
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      newPassword: long,
      confirmPassword: long,
    });
    assert.ok("newPassword" in errs);
  });

  it("rejects a new password without an uppercase letter", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      newPassword: "newsecret1",
      confirmPassword: "newsecret1",
    });
    assert.ok("newPassword" in errs);
  });

  it("rejects a new password without a lowercase letter", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      newPassword: "NEWSECRET1",
      confirmPassword: "NEWSECRET1",
    });
    assert.ok("newPassword" in errs);
  });

  it("rejects a new password without a digit", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      newPassword: "NewSecretPass",
      confirmPassword: "NewSecretPass",
    });
    assert.ok("newPassword" in errs);
  });

  it("rejects mismatched confirm password", () => {
    const errs = fieldErrors(changePasswordSchema, {
      ...validPasswordChange,
      confirmPassword: "Different1",
    });
    assert.ok("confirmPassword" in errs);
  });

  it("rejects a new password equal to the current password", () => {
    const errs = fieldErrors(changePasswordSchema, {
      currentPassword: "Secret1234",
      newPassword: "Secret1234",
      confirmPassword: "Secret1234",
    });
    assert.ok("newPassword" in errs);
  });
});

const validItem = {
  name: "MacBook Pro 14",
  categoryId: "5a9d1c40-0a0e-4f0b-8b1a-2c3d4e5f6a7b",
  brand: "Apple",
  model: "M3",
  serialNumber: "C02-XK81QJG5H",
  purchaseDate: "2025-04-12",
  notes: "Frontend laptop",
};

describe("itemSchema", () => {
  it("accepts a complete item", () => {
    assert.ok(itemSchema.safeParse(validItem).success);
  });

  it("accepts an item with only the required fields", () => {
    const result = itemSchema.safeParse({ name: "Monitor", categoryId: validItem.categoryId });
    assert.ok(result.success);
    assert.equal(result.data?.brand, undefined);
    assert.equal(result.data?.serialNumber, undefined);
  });

  it("rejects a short or blank name", () => {
    assert.ok("name" in fieldErrors(itemSchema, { ...validItem, name: "X" }));
    assert.ok("name" in fieldErrors(itemSchema, { ...validItem, name: "   " }));
  });

  it("rejects a name longer than 100 characters", () => {
    const errs = fieldErrors(itemSchema, { ...validItem, name: "a".repeat(101) });
    assert.ok("name" in errs);
  });

  it("requires a valid category id", () => {
    assert.ok("categoryId" in fieldErrors(itemSchema, { ...validItem, categoryId: "nope" }));
  });

  it("rejects an invalid serial number", () => {
    assert.ok("serialNumber" in fieldErrors(itemSchema, { ...validItem, serialNumber: "ab" }));
    assert.ok(
      "serialNumber" in fieldErrors(itemSchema, { ...validItem, serialNumber: "has spaces" }),
    );
  });

  it("rejects a purchase date in the future", () => {
    const errs = fieldErrors(itemSchema, { ...validItem, purchaseDate: "2999-01-01" });
    assert.ok("purchaseDate" in errs);
  });

  it("rejects notes longer than 500 characters", () => {
    const errs = fieldErrors(itemSchema, { ...validItem, notes: "a".repeat(501) });
    assert.ok("notes" in errs);
  });
});

describe("itemStatusSchema", () => {
  it("accepts the API status values", () => {
    for (const value of ["AVAILABLE", "IN_REPAIR", "RETIRED"]) {
      assert.ok(itemStatusSchema.safeParse(value).success);
    }
  });

  it("rejects ASSIGNED and unknown values", () => {
    assert.equal(itemStatusSchema.safeParse("ASSIGNED").success, false);
    assert.equal(itemStatusSchema.safeParse("UNKNOWN").success, false);
  });
});

const USER_ID = "22222222-2222-4222-8222-222222222222";

describe("assignSchema", () => {
  it("accepts a user id with no note", () => {
    const result = assignSchema.safeParse({ userId: USER_ID });
    assert.ok(result.success);
    assert.equal(result.data?.note, undefined);
  });

  it("trims a note", () => {
    const result = assignSchema.safeParse({ userId: USER_ID, note: "  Handover  " });
    assert.ok(result.success);
    assert.equal(result.data?.note, "Handover");
  });

  it("rejects a missing user id", () => {
    assert.ok("userId" in fieldErrors(assignSchema, {}));
  });

  it("rejects a malformed user id", () => {
    assert.ok("userId" in fieldErrors(assignSchema, { userId: "nope" }));
  });

  it("rejects a note longer than 250 characters", () => {
    assert.ok("note" in fieldErrors(assignSchema, { userId: USER_ID, note: "a".repeat(251) }));
  });

  it("treats a whitespace-only note as empty", () => {
    const result = assignSchema.safeParse({ userId: USER_ID, note: "   " });
    assert.ok(result.success);
    assert.equal(result.data?.note, null);
  });
});

describe("unassignSchema", () => {
  it("accepts an empty body", () => {
    assert.ok(unassignSchema.safeParse({}).success);
  });

  it("accepts an optional note", () => {
    const result = unassignSchema.safeParse({ note: "Returned to stock" });
    assert.ok(result.success);
    assert.equal(result.data?.note, "Returned to stock");
  });

  it("rejects a note longer than 250 characters", () => {
    assert.ok("note" in fieldErrors(unassignSchema, { note: "a".repeat(251) }));
  });
});

describe("teamSchema", () => {
  it("trims and accepts a valid team", () => {
    const result = teamSchema.safeParse({
      name: "  Engineering  ",
      description: "  Build systems  ",
    });
    assert.ok(result.success);
    assert.equal(result.data?.name, "Engineering");
    assert.equal(result.data?.description, "Build systems");
  });

  it("rejects a short team name", () => {
    assert.ok("name" in fieldErrors(teamSchema, { name: " " }));
  });

  it("rejects a description longer than 250 characters", () => {
    assert.ok(
      "description" in
        fieldErrors(teamSchema, { name: "Engineering", description: "a".repeat(251) }),
    );
  });
});
