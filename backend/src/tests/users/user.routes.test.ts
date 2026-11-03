import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import app from "../../app";

describe("User routes", () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;

  async function patchJson(path: string, body: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function get(path: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`);
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

  describe("PATCH /api/users/me", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await patchJson("/api/users/me", {
        firstName: "Innocent",
      });

      assert.equal(response.status, 401);
    });
  });

  describe("PATCH /api/users/me/password", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await patchJson("/api/users/me/password", {
        currentPassword: "Password123",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      });

      assert.equal(response.status, 401);
    });
  });

  describe("GET /api/users/me/items", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await get("/api/users/me/items");

      assert.equal(response.status, 401);
    });
  });

  describe("GET /api/users/me/assignments", () => {
    it("rejects an unauthenticated request", async () => {
      const response = await get("/api/users/me/assignments");

      assert.equal(response.status, 401);
    });
  });
});
