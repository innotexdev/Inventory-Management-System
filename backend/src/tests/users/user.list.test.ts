import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import app from "../../app";

describe("Manager user routes", () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;
  let managerCookie: string;
  let employeeCookie: string;
  let knownUserId: string;

  function get(path: string, cookie?: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      headers: cookie ? { cookie } : undefined,
    });
  }

  async function login(email: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "Start1234" }),
    });
    assert.equal(res.status, 200);
    const cookie = res.headers.getSetCookie().find((value) => value.startsWith("sid="));
    assert.ok(cookie);
    return cookie.split(";")[0];
  }

  before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
    managerCookie = await login("mia.frontend@company.com");
    employeeCookie = await login("finn.fe@company.com");

    const res = await get("/api/users", managerCookie);
    const body = (await res.json()) as { data: Array<{ id: string }> };
    knownUserId = body.data[0].id;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  describe("GET /api/users", () => {
    it("requires a session", async () => {
      assert.equal((await get("/api/users")).status, 401);
    });

    it("rejects an Employee with 403", async () => {
      assert.equal((await get("/api/users", employeeCookie)).status, 403);
    });

    it("returns a paginated list with held item counts", async () => {
      const res = await get("/api/users?page=1&pageSize=5", managerCookie);
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        data: Array<{ id: string; email: string; heldItemsCount: number; passwordHash?: string }>;
        meta: { page: number; pageSize: number; total: number; totalPages: number };
      };
      assert.equal(body.data.length, 5);
      assert.equal(body.meta.page, 1);
      assert.equal(body.meta.pageSize, 5);
      assert.ok(body.meta.total >= 5);
      for (const user of body.data) {
        assert.equal(typeof user.heldItemsCount, "number");
        assert.equal(user.passwordHash, undefined);
      }
    });

    it("filters by search, role and active status", async () => {
      const search = await get("/api/users?search=finn.fe@company.com", managerCookie);
      const searchBody = (await search.json()) as {
        data: Array<{ email: string }>;
      };
      assert.equal(searchBody.data.length, 1);
      assert.equal(searchBody.data[0].email, "finn.fe@company.com");

      const role = await get("/api/users?role=MANAGER", managerCookie);
      const roleBody = (await role.json()) as { data: Array<{ role: string }> };
      assert.ok(roleBody.data.length > 0);
      assert.ok(roleBody.data.every((user) => user.role === "MANAGER"));

      const inactive = await get("/api/users?isActive=false", managerCookie);
      const inactiveBody = (await inactive.json()) as {
        data: Array<{ email: string; isActive: boolean }>;
      };
      assert.ok(inactiveBody.data.some((user) => user.email === "zoe.design@company.com"));
      assert.ok(inactiveBody.data.every((user) => user.isActive === false));
    });

    it("filters by team", async () => {
      const teams = await get("/api/teams", managerCookie);
      assert.equal(teams.status, 200);
      const teamsBody = (await teams.json()) as { data: Array<{ id: string; name: string }> };
      const frontend = teamsBody.data.find((team) => team.name === "Frontend");
      assert.ok(frontend);

      const res = await get(`/api/users?teamId=${frontend.id}`, managerCookie);
      const body = (await res.json()) as { data: Array<{ teamId: string | null }> };
      assert.ok(body.data.length > 0);
      assert.ok(body.data.every((user) => user.teamId === frontend.id));
    });

    it("returns an empty page past the last one", async () => {
      const res = await get("/api/users?page=999", managerCookie);
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        data: unknown[];
        meta: { page: number; totalPages: number };
      };
      assert.deepEqual(body.data, []);
      assert.equal(body.meta.page, 999);
      assert.ok(body.meta.totalPages < 999);
    });
  });

  describe("GET /api/users/:id", () => {
    it("returns user detail for a Manager", async () => {
      const res = await get(`/api/users/${knownUserId}`, managerCookie);
      assert.equal(res.status, 200);
      const body = (await res.json()) as { data: { id: string; passwordHash?: string } };
      assert.equal(body.data.id, knownUserId);
      assert.equal(body.data.passwordHash, undefined);
    });

    it("rejects an Employee", async () => {
      assert.equal((await get(`/api/users/${knownUserId}`, employeeCookie)).status, 403);
    });

    it("returns 404 for a missing user and 400 for a malformed id", async () => {
      assert.equal(
        (await get("/api/users/99999999-9999-4999-8999-999999999999", managerCookie)).status,
        404,
      );
      assert.equal((await get("/api/users/nope", managerCookie)).status, 400);
    });
  });

  describe("GET /api/users/:id/items and /assignments", () => {
    it("returns the user's held items and full history", async () => {
      const items = await get(`/api/users/${knownUserId}/items`, managerCookie);
      const assignments = await get(`/api/users/${knownUserId}/assignments`, managerCookie);
      assert.equal(items.status, 200);
      assert.equal(assignments.status, 200);
      const itemsBody = (await items.json()) as { data: unknown[] };
      const assignmentsBody = (await assignments.json()) as { data: unknown[] };
      assert.ok(Array.isArray(itemsBody.data));
      assert.ok(Array.isArray(assignmentsBody.data));
    });

    it("rejects an Employee", async () => {
      assert.equal((await get(`/api/users/${knownUserId}/items`, employeeCookie)).status, 403);
      assert.equal(
        (await get(`/api/users/${knownUserId}/assignments`, employeeCookie)).status,
        403,
      );
    });

    it("returns 404 for a missing user", async () => {
      const id = "99999999-9999-4999-8999-999999999999";
      assert.equal((await get(`/api/users/${id}/items`, managerCookie)).status, 404);
      assert.equal((await get(`/api/users/${id}/assignments`, managerCookie)).status, 404);
    });
  });
});
