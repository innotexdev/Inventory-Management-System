import { Router } from "express";
import { login, registerUser, logout, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/require-auth";
import { loginRateLimiter } from "../middleware/rate-limiter";
import { validateBody } from "../middleware/validate-body";
import { loginSchema, registerSchema } from "../validation/auth.validation";

const router = Router();

router.post("/login", validateBody(loginSchema), loginRateLimiter, login);
router.post("/register", validateBody(registerSchema), registerUser);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
