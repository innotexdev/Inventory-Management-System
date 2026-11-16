import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import app from "../../app";

const ITEM_ID = "11111111-1111-4111-8111-111111111111";

describe("Inventory routes", () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;

  function get(path: string): Promise<Response> {
    return fetch(`${baseUrl}${path}`);
  }

  function postJson(path: string, body: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function patchJson(path: string, body: unknown): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: "PATCH",
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

  it("rejects unauthenticated category listing", async () => {
    assert.equal((await get("/api/categories")).status, 401);
  });

  it("rejects unauthenticated item listing", async () => {
    assert.equal((await get("/api/items")).status, 401);
  });

  it("rejects unauthenticated item creation", async () => {
    assert.equal(
      (await postJson("/api/items", { name: "Mouse", categoryId: ITEM_ID })).status,
      401,
    );
  });

  it("rejects unauthenticated item detail", async () => {
    assert.equal((await get(`/api/items/${ITEM_ID}`)).status, 401);
  });

  it("rejects unauthenticated item update", async () => {
    assert.equal((await patchJson(`/api/items/${ITEM_ID}`, { name: "Mouse" })).status, 401);
  });

  it("rejects unauthenticated status change", async () => {
    assert.equal(
      (await postJson(`/api/items/${ITEM_ID}/status`, { status: "IN_REPAIR" })).status,
      401,
    );
  });

  it("rejects unauthenticated item history", async () => {
    assert.equal((await get(`/api/items/${ITEM_ID}/assignments`)).status, 401);
  });

  it("rejects unauthenticated stats", async () => {
    assert.equal((await get("/api/stats/inventory")).status, 401);
  });
});
