import { Router } from "express";
import { login, registerUser, logout, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/require-auth";
import { authorize } from "../middleware/authorize";
import { Role } from "../generated/enums";

const router = Router();

router.post("/login", login);
router.post("/register", registerUser);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);

export default router;
