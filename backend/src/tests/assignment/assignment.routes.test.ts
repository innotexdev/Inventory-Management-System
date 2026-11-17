import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import app from "../../app";
import { prisma } from "../../lib/prisma";
import { ItemStatus, Role } from "../../generated/enums";

const SEED_PASSWORD = "Start1234";
const MISSING_UUID = "99999999-9999-4999-8999-999999999999";

describe("Assignment routes", () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;
  let managerCookie: string;
  let adminCookie: string;
  let employeeCookie: string;
  let managerId: string;
  let adminId: string;
  let categoryId: string;
  let activeUserId: string;
  let inactiveUserId: string;
  let otherUserId: string;
  const stamp = Date.now().toString(36);
  const createdItemIds: string[] = [];
  const createdUserIds: string[] = [];

  function get(path: string, cookie?: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      headers: cookie ? { cookie } : undefined,
    });
  }

  function postJson(path: string, body: unknown, cookie?: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  async function login(email: string, password: string): Promise<string> {
    const res = await postJson("/api/auth/login", { email, password });
    assert.equal(res.status, 200, `login failed for ${email}`);
    const cookie = res.headers.getSetCookie().find((value) => value.startsWith("sid="));
    assert.ok(cookie, "expected a session cookie");
    return cookie.split(";")[0];
  }

  async function makeItem(status: ItemStatus = ItemStatus.AVAILABLE): Promise<string> {
    const item = await prisma.item.create({
      data: {
        name: `M5 ${status} ${stamp} ${Math.random().toString(36).slice(2)}`,
        categoryId,
        status,
      },
    });
    createdItemIds.push(item.id);
    return item.id;
  }

  async function makeAssignment(
    itemId: string,
    userId: string,
    note?: string,
  ): Promise<{ id: string }> {
    return prisma.assignment.create({
      data: { itemId, userId, assignedById: managerId, note },
      select: { id: true },
    });
  }

  async function history(itemId: string) {
    const res = await get(`/api/items/${itemId}/assignments`, managerCookie);
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      data: Array<{
        id: string;
        assignedAt: string;
        returnedAt: string | null;
        note: string | null;
        assignedBy: { id: string };
        returnedBy: { id: string } | null;
      }>;
    };
    return body.data;
  }

  before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    const category = await prisma.category.findFirstOrThrow();
    categoryId = category.id;

    const manager = await prisma.user.findFirstOrThrow({ where: { role: Role.MANAGER } });
    const admin = await prisma.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    managerId = manager.id;
    adminId = admin.id;

    managerCookie = await login(manager.email, SEED_PASSWORD);
    adminCookie = await login(admin.email, SEED_PASSWORD);
    employeeCookie = await login("finn.fe@company.com", SEED_PASSWORD);

    for (const [key, isActive] of [
      ["active", true],
      ["inactive", false],
      ["other", true],
    ] as const) {
      const user = await prisma.user.create({
        data: {
          firstName: "Assign",
          lastName: key,
          email: `m5-${key}-${stamp}@example.com`,
          passwordHash: "unused",
          isActive,
        },
        select: { id: true },
      });
      createdUserIds.push(user.id);
      if (key === "active") activeUserId = user.id;
      if (key === "inactive") inactiveUserId = user.id;
      if (key === "other") otherUserId = user.id;
    }
  });

  after(async () => {
    await prisma.assignment.deleteMany({ where: { itemId: { in: createdItemIds } } });
    await prisma.assignment.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.item.deleteMany({ where: { id: { in: createdItemIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  describe("POST /api/items/:id/assign", () => {
    it("requires a session", async () => {
      const itemId = await makeItem();
      const res = await postJson(`/api/items/${itemId}/assign`, { userId: activeUserId });
      assert.equal(res.status, 401);
    });

    it("rejects an Employee with 403", async () => {
      const itemId = await makeItem();
      const res = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: activeUserId },
        employeeCookie,
      );
      assert.equal(res.status, 403);
    });

    it("assigns an available item and records the history", async () => {
      const itemId = await makeItem();
      const res = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: activeUserId, note: "First note" },
        managerCookie,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        data: { status: string; currentHolder: { id: string } | null };
      };
      assert.equal(body.data.status, "ASSIGNED");
      assert.equal(body.data.currentHolder?.id, activeUserId);

      const rows = await history(itemId);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].assignedBy.id, managerId);
      assert.equal(rows[0].returnedAt, null);
      assert.equal(rows[0].note, "First note");
    });

    it("rejects assigning an item that is not Available", async () => {
      const assigned = await makeItem();
      await makeAssignment(assigned, activeUserId);
      const repair = await makeItem(ItemStatus.IN_REPAIR);
      const retired = await makeItem(ItemStatus.RETIRED);

      for (const itemId of [assigned, repair, retired]) {
        const res = await postJson(
          `/api/items/${itemId}/assign`,
          { userId: activeUserId },
          managerCookie,
        );
        assert.equal(res.status, 409);
        const body = (await res.json()) as { error: { message: string } };
        assert.equal(body.error.message, "Item is not available");
      }
    });

    it("rejects assigning to a deactivated user", async () => {
      const itemId = await makeItem();
      const res = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: inactiveUserId },
        adminCookie,
      );
      assert.equal(res.status, 409);
      const body = (await res.json()) as { error: { message: string } };
      assert.equal(body.error.message, "User is not active");
    });

    it("returns 404 when the item or user does not exist", async () => {
      const itemId = await makeItem();
      const missingUser = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: MISSING_UUID },
        managerCookie,
      );
      assert.equal(missingUser.status, 404);

      const missingItem = await postJson(
        `/api/items/${MISSING_UUID}/assign`,
        { userId: activeUserId },
        managerCookie,
      );
      assert.equal(missingItem.status, 404);
    });

    it("rejects malformed ids and invalid bodies with 400", async () => {
      const itemId = await makeItem();
      assert.equal(
        (await postJson("/api/items/not-a-uuid/assign", { userId: activeUserId }, managerCookie))
          .status,
        400,
      );
      assert.equal((await postJson(`/api/items/${itemId}/assign`, {}, managerCookie)).status, 400);
      assert.equal(
        (
          await postJson(
            `/api/items/${itemId}/assign`,
            { userId: activeUserId, note: "a".repeat(251) },
            managerCookie,
          )
        ).status,
        400,
      );
    });

    it("produces exactly one assignment for two simultaneous requests", async () => {
      const itemId = await makeItem();
      const [first, second] = await Promise.all([
        postJson(`/api/items/${itemId}/assign`, { userId: activeUserId }, managerCookie),
        postJson(`/api/items/${itemId}/assign`, { userId: otherUserId }, adminCookie),
      ]);
      const statuses = [first.status, second.status].sort();
      assert.deepEqual(statuses, [200, 409]);
      const conflict = first.status === 409 ? first : second;
      const body = (await conflict.json()) as { error: { message: string } };
      assert.equal(body.error.message, "Item is not available");

      const rows = await history(itemId);
      assert.equal(rows.length, 1);
    });

    it("produces exactly one assignment for a double click", async () => {
      const itemId = await makeItem();
      const body = { userId: activeUserId };
      const first = await postJson(`/api/items/${itemId}/assign`, body, managerCookie);
      const second = await postJson(`/api/items/${itemId}/assign`, body, managerCookie);
      assert.equal(first.status, 200);
      assert.equal(second.status, 409);
      assert.equal((await history(itemId)).length, 1);
    });

    it("lets a Manager assign an item to themselves", async () => {
      const itemId = await makeItem();
      const res = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: managerId },
        managerCookie,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        data: { currentHolder: { id: string } | null };
      };
      assert.equal(body.data.currentHolder?.id, managerId);
    });
  });

  describe("POST /api/items/:id/unassign", () => {
    it("requires a session and rejects an Employee", async () => {
      const itemId = await makeItem();
      await makeAssignment(itemId, activeUserId);
      assert.equal((await postJson(`/api/items/${itemId}/unassign`, {})).status, 401);
      assert.equal(
        (await postJson(`/api/items/${itemId}/unassign`, {}, employeeCookie)).status,
        403,
      );
    });

    it("rejects unassigning an item with no active assignment", async () => {
      const available = await makeItem();
      const repair = await makeItem(ItemStatus.IN_REPAIR);
      for (const itemId of [available, repair]) {
        const res = await postJson(`/api/items/${itemId}/unassign`, {}, managerCookie);
        assert.equal(res.status, 409);
        const body = (await res.json()) as { error: { message: string } };
        assert.equal(body.error.message, "Item is not assigned");
      }
    });

    it("closes the active assignment and frees the item", async () => {
      const itemId = await makeItem();
      await makeAssignment(itemId, activeUserId, "Original note");
      const res = await postJson(
        `/api/items/${itemId}/unassign`,
        { note: "Returned to stock" },
        managerCookie,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as {
        data: { status: string; currentHolder: { id: string } | null };
      };
      assert.equal(body.data.status, "AVAILABLE");
      assert.equal(body.data.currentHolder, null);

      const rows = await history(itemId);
      assert.equal(rows.length, 1);
      assert.ok(rows[0].returnedAt !== null);
      assert.equal(rows[0].returnedBy?.id, managerId);
      assert.equal(rows[0].note, "Returned to stock");
    });

    it("keeps the assignment note when the return has no note", async () => {
      const itemId = await makeItem();
      await makeAssignment(itemId, activeUserId, "Original note");
      const res = await postJson(`/api/items/${itemId}/unassign`, {}, managerCookie);
      assert.equal(res.status, 200);
      assert.equal((await history(itemId))[0].note, "Original note");
    });

    it("returns 404 for a missing item and 400 for a malformed id", async () => {
      assert.equal(
        (await postJson(`/api/items/${MISSING_UUID}/unassign`, {}, managerCookie)).status,
        404,
      );
      assert.equal((await postJson("/api/items/nope/unassign", {}, managerCookie)).status, 400);
    });

    it("keeps past holders in history after they are deactivated", async () => {
      const itemId = await makeItem();
      await makeAssignment(itemId, activeUserId);
      await prisma.user.update({ where: { id: activeUserId }, data: { isActive: false } });
      const res = await postJson(`/api/items/${itemId}/unassign`, {}, adminCookie);
      assert.equal(res.status, 200);
      await prisma.user.update({ where: { id: activeUserId }, data: { isActive: true } });

      const rows = await history(itemId);
      assert.equal(rows.length, 1);
      assert.ok(rows[0].returnedAt !== null);
      assert.equal(rows[0].assignedBy.id, managerId);
    });

    it("shows every period with dates and actors after a second assignment", async () => {
      const itemId = await makeItem();
      await makeAssignment(itemId, activeUserId);
      const first = await postJson(`/api/items/${itemId}/unassign`, {}, managerCookie);
      assert.equal(first.status, 200);
      const second = await postJson(
        `/api/items/${itemId}/assign`,
        { userId: otherUserId },
        adminCookie,
      );
      assert.equal(second.status, 200);

      const rows = await history(itemId);
      assert.equal(rows.length, 2);
      const active = rows.find((row) => row.returnedAt === null);
      const returned = rows.find((row) => row.returnedAt !== null);
      assert.ok(active);
      assert.ok(returned);
      assert.equal(returned.returnedBy?.id, managerId);
      assert.equal(active.assignedBy.id, adminId);
    });
  });
});
