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

router.use(requireAuth);

router.patch("/me", validateBody(updateUserSchema), updateMyInfo);
router.patch("/me/password", validateBody(changePasswordSchema), changeUserPassword);
router.get("/me/items", getMyItems);
router.get("/me/assignments", getMyAssignments);

export default router;
