import { Router } from "express";
import { Role } from "../generated/enums";
import {
  changeItemStatusHandler,
  createItemHandler,
  getInventoryStatsHandler,
  getItemHandler,
  listCategoriesHandler,
  listItemAssignmentsHandler,
  listItemsHandler,
  updateItemHandler,
} from "../controllers/inventory.controller";
import { authorize } from "../middleware/authorize";
import { requireAuth } from "../middleware/require-auth";
import { validateBody } from "../middleware/validate-body";
import { validateUuidParam } from "../middleware/validate-uuid-param";
import {
  changeItemStatusSchema,
  createItemSchema,
  updateItemSchema,
} from "../validation/inventory.validation";

function useManagerGuard(router: Router): void {
  router.use(requireAuth);
  router.use(authorize(Role.MANAGER));
}

export const itemRouter = Router();
useManagerGuard(itemRouter);

itemRouter.get("/", listItemsHandler);
itemRouter.post("/", validateBody(createItemSchema), createItemHandler);
itemRouter.get("/:id", validateUuidParam("id"), getItemHandler);
itemRouter.patch(
  "/:id",
  validateUuidParam("id"),
  validateBody(updateItemSchema),
  updateItemHandler,
);
itemRouter.post(
  "/:id/status",
  validateUuidParam("id"),
  validateBody(changeItemStatusSchema),
  changeItemStatusHandler,
);
itemRouter.get("/:id/assignments", validateUuidParam("id"), listItemAssignmentsHandler);

export const categoryRouter = Router();
useManagerGuard(categoryRouter);
categoryRouter.get("/", listCategoriesHandler);

export const statsRouter = Router();
useManagerGuard(statsRouter);
statsRouter.get("/inventory", getInventoryStatsHandler);
