import { ForbiddenError } from "./errors";
import { ItemStatus, Role } from "../generated/enums";
import { ItemConflictError } from "./inventory-errors";

export type ItemStatusView = ItemStatus | "ASSIGNED";

export function effectiveStatus(stored: ItemStatus, hasActiveAssignment: boolean): ItemStatusView {
  return hasActiveAssignment ? "ASSIGNED" : stored;
}

const ALLOWED_TRANSITIONS: Record<ItemStatusView, readonly ItemStatus[]> = {
  AVAILABLE: [ItemStatus.IN_REPAIR, ItemStatus.RETIRED],
  IN_REPAIR: [ItemStatus.AVAILABLE, ItemStatus.RETIRED],
  ASSIGNED: [],
  RETIRED: [],
};

export function assertStatusTransition(
  current: ItemStatusView,
  target: ItemStatus,
  role: Role,
): void {
  if (target === ItemStatus.RETIRED && role !== Role.ADMIN) {
    throw new ForbiddenError();
  }

  if (!ALLOWED_TRANSITIONS[current].includes(target)) {
    throw new ItemConflictError(`Cannot change status from ${current} to ${target}`);
  }
}
