import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ForbiddenError } from "../../lib/errors";
import { ItemConflictError } from "../../lib/inventory-errors";
import { assertStatusTransition, effectiveStatus } from "../../lib/item-status";
import { ItemStatus, Role } from "../../generated/enums";
import type { ItemStatusView } from "../../lib/item-status";

function assertConflict(current: ItemStatusView, target: ItemStatus, role: Role): void {
  assert.throws(() => assertStatusTransition(current, target, role), ItemConflictError);
}

describe("effectiveStatus", () => {
  it("returns ASSIGNED when there is an active assignment", () => {
    assert.equal(effectiveStatus(ItemStatus.AVAILABLE, true), "ASSIGNED");
    assert.equal(effectiveStatus(ItemStatus.IN_REPAIR, true), "ASSIGNED");
  });

  it("returns the stored status when there is no active assignment", () => {
    assert.equal(effectiveStatus(ItemStatus.AVAILABLE, false), "AVAILABLE");
    assert.equal(effectiveStatus(ItemStatus.IN_REPAIR, false), "IN_REPAIR");
    assert.equal(effectiveStatus(ItemStatus.RETIRED, false), "RETIRED");
  });
});

describe("assertStatusTransition", () => {
  it("allows Available to In repair for Manager and Admin", () => {
    assert.doesNotThrow(() =>
      assertStatusTransition("AVAILABLE", ItemStatus.IN_REPAIR, Role.MANAGER),
    );
    assert.doesNotThrow(() =>
      assertStatusTransition("AVAILABLE", ItemStatus.IN_REPAIR, Role.ADMIN),
    );
  });

  it("allows In repair to Available for Manager and Admin", () => {
    assert.doesNotThrow(() =>
      assertStatusTransition("IN_REPAIR", ItemStatus.AVAILABLE, Role.MANAGER),
    );
    assert.doesNotThrow(() =>
      assertStatusTransition("IN_REPAIR", ItemStatus.AVAILABLE, Role.ADMIN),
    );
  });

  it("allows Available to Retired for Admin only", () => {
    assert.doesNotThrow(() => assertStatusTransition("AVAILABLE", ItemStatus.RETIRED, Role.ADMIN));
    assert.throws(
      () => assertStatusTransition("AVAILABLE", ItemStatus.RETIRED, Role.MANAGER),
      ForbiddenError,
    );
    assert.throws(
      () => assertStatusTransition("AVAILABLE", ItemStatus.RETIRED, Role.EMPLOYEE),
      ForbiddenError,
    );
  });

  it("allows In repair to Retired for Admin only", () => {
    assert.doesNotThrow(() => assertStatusTransition("IN_REPAIR", ItemStatus.RETIRED, Role.ADMIN));
    assert.throws(
      () => assertStatusTransition("IN_REPAIR", ItemStatus.RETIRED, Role.MANAGER),
      ForbiddenError,
    );
  });

  it("rejects Available to Available", () => {
    assertConflict("AVAILABLE", ItemStatus.AVAILABLE, Role.ADMIN);
  });

  it("rejects In repair to In repair", () => {
    assertConflict("IN_REPAIR", ItemStatus.IN_REPAIR, Role.ADMIN);
  });

  it("rejects every transition from Assigned", () => {
    assertConflict("ASSIGNED", ItemStatus.AVAILABLE, Role.ADMIN);
    assertConflict("ASSIGNED", ItemStatus.IN_REPAIR, Role.ADMIN);
    assertConflict("ASSIGNED", ItemStatus.RETIRED, Role.ADMIN);
  });

  it("rejects every transition from Retired", () => {
    assertConflict("RETIRED", ItemStatus.AVAILABLE, Role.ADMIN);
    assertConflict("RETIRED", ItemStatus.IN_REPAIR, Role.ADMIN);
    assertConflict("RETIRED", ItemStatus.RETIRED, Role.ADMIN);
  });
});
