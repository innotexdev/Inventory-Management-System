import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import {
  changeUserPassword,
  getMyAssignments,
  getMyItems,
  updateMyInfo,
} from "../controllers/user.controller";
import { validateBody } from "../middleware/validate-body";
import { changePasswordSchema, updateUserSchema } from "../validation/user.validation";

const router = Router();

router.patch("/me", requireAuth, validateBody(updateUserSchema), updateMyInfo);
router.patch("/me/password", requireAuth, validateBody(changePasswordSchema), changeUserPassword);
router.get("/me/items", requireAuth, getMyItems);
router.get("/me/assignments", requireAuth, getMyAssignments);

export default router;
