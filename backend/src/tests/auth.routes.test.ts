import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import app from "../app";

describe("Auth routes", () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;

  async function postJson(path: string, body: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  before(async () => {
    server = app.listen(0);

    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  describe("POST /api/auth/register", () => {
    const validRegistration = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    };

    it("rejects missing registration fields", async () => {
      const response = await postJson("/api/auth/register", {});

      assert.equal(response.status, 400);
    });

    it("rejects an invalid email", async () => {
      const response = await postJson("/api/auth/register", {
        ...validRegistration,
        email: "invalid-email",
      });

      assert.equal(response.status, 400);
    });

    it("rejects a password shorter than 8 characters", async () => {
      const response = await postJson("/api/auth/register", {
        ...validRegistration,
        password: "Pass1",
        confirmPassword: "Pass1",
      });

      assert.equal(response.status, 400);
    });

    it("rejects mismatched passwords", async () => {
      const response = await postJson("/api/auth/register", {
        ...validRegistration,
        confirmPassword: "Password456",
      });

      assert.equal(response.status, 400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("rejects missing credentials", async () => {
      const response = await postJson("/api/auth/login", {});

      assert.equal(response.status, 400);
    });

    it("rejects an invalid email", async () => {
      const response = await postJson("/api/auth/login", {
        email: "invalid-email",
        password: "Password123",
      });

      assert.equal(response.status, 400);
    });

    it("rejects an empty password", async () => {
      const response = await postJson("/api/auth/login", {
        email: "test@example.com",
        password: "",
      });

      assert.equal(response.status, 400);
    });

    it("rejects invalid credentials", async () => {
      const response = await postJson("/api/auth/login", {
        email: "nonexistent@example.com",
        password: "Password123",
      });

      assert.equal(response.status, 401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the session cookie and returns 204", async () => {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
      });

      assert.equal(response.status, 204);

      const setCookie = response.headers.get("set-cookie");

      assert.ok(setCookie, "Expected a session-clearing Set-Cookie header");
      assert.match(setCookie, /Max-Age=0|Expires=/i);
    });
  });

  describe("GET /api/auth/me", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await fetch(`${baseUrl}/api/auth/me`);

      assert.equal(response.status, 401);
    });
  });
});
