import { Router } from "express";
import { login, registerUser, logout, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/require-auth";
import { authorize } from "../middleware/authorize";
import { Role } from "../generated/enums";

const router = Router();

router.post("/login", login);
router.post("/register", registerUser);
router.post("/logout", requireAuth, authorize(Role.EMPLOYEE), logout);
router.get("/me", requireAuth, authorize(Role.EMPLOYEE), getMe);

export default router;
