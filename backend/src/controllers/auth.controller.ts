import { NextFunction, Request, Response } from "express";
import { register, verifyCredentials } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/require-auth";
import { clearSessionCookie, setSessionCookie } from "../lib/session";

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await verifyCredentials(req.body);
    setSessionCookie(res, user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await register(req.body);
    setSessionCookie(res, user.id);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response): void {
  clearSessionCookie(req, res);
  res.status(204).end();
}

export function getMe(req: Request, res: Response): void {
  res.json({ data: (req as AuthenticatedRequest).user });
}
