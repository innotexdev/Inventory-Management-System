import { Router } from "express";
import { login, registerUser, logout, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.post("/login", login);
router.post("/register", registerUser);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
