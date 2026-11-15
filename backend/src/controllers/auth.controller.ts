import { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { register, verifyCredentials } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/require-auth";
import { clearSessionCookie, setSessionCookie } from "../lib/session";
import { LoginInput, RegisterInput } from "../validation/auth.validation";

export async function login(
  req: Request<ParamsDictionary, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await verifyCredentials(req.body);
    setSessionCookie(res, user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(
  req: Request<ParamsDictionary, unknown, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await register(req.body);
    setSessionCookie(res, user.id);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res);
  res.status(204).end();
}

export function getMe(req: Request, res: Response): void {
  res.json({ data: (req as AuthenticatedRequest).user });
}
