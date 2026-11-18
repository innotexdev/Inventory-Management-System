import { Router } from "express";
import { Role } from "../generated/enums";
import {
  createTeamHandler,
  deleteTeamHandler,
  listTeamsHandler,
  updateTeamHandler,
} from "../controllers/team.controller";
import { authorize } from "../middleware/authorize";
import { requireAuth } from "../middleware/require-auth";
import { validateBody } from "../middleware/validate-body";
import { validateUuidParam } from "../middleware/validate-uuid-param";
import { createTeamSchema, updateTeamSchema } from "../validation/team.validation";

const router = Router();

router.use(requireAuth);
router.use(authorize(Role.MANAGER));
router.get("/", listTeamsHandler);

const adminRouter = Router();
adminRouter.use(authorize(Role.ADMIN));
adminRouter.post("/", validateBody(createTeamSchema), createTeamHandler);
adminRouter.patch(
  "/:id",
  validateUuidParam("id"),
  validateBody(updateTeamSchema),
  updateTeamHandler,
);
adminRouter.delete("/:id", validateUuidParam("id"), deleteTeamHandler);
router.use(adminRouter);

export default router;
