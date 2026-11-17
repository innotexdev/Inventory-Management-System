import { Router } from "express";
import { Role } from "../generated/enums";
import { listTeamsHandler } from "../controllers/team.controller";
import { authorize } from "../middleware/authorize";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.use(requireAuth);
router.use(authorize(Role.MANAGER));
router.get("/", listTeamsHandler);

export default router;
