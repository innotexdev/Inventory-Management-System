import { Router } from "express";
import { Role } from "../generated/enums";
import { authorize } from "../middleware/authorize";
import { requireAuth } from "../middleware/require-auth";
import {
  changeUserPassword,
  getMyAssignments,
  getMyItems,
  getUserAssignmentsHandler,
  getUserHandler,
  getUserItemsHandler,
  listUsersHandler,
  updateMyInfo,
  adminUpdateUserHandler,
} from "../controllers/user.controller";
import { validateBody } from "../middleware/validate-body";
import { validateUuidParam } from "../middleware/validate-uuid-param";
import {
  adminUpdateUserSchema,
  changePasswordSchema,
  updateUserSchema,
} from "../validation/user.validation";

const router = Router();

router.use(requireAuth);

router.patch("/me", validateBody(updateUserSchema), updateMyInfo);
router.patch("/me/password", validateBody(changePasswordSchema), changeUserPassword);
router.get("/me/items", getMyItems);
router.get("/me/assignments", getMyAssignments);

const managerRouter = Router();
managerRouter.use(authorize(Role.MANAGER));
managerRouter.get("/", listUsersHandler);
managerRouter.get("/:id", validateUuidParam("id"), getUserHandler);
managerRouter.get("/:id/items", validateUuidParam("id"), getUserItemsHandler);
managerRouter.get("/:id/assignments", validateUuidParam("id"), getUserAssignmentsHandler);

router.patch(
  "/:id",
  authorize(Role.ADMIN),
  validateUuidParam("id"),
  validateBody(adminUpdateUserSchema),
  adminUpdateUserHandler,
);

router.use(managerRouter);

export default router;
