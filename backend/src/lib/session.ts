import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";
export const SESSION_COOKIE = "sid";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionClaims {
  sub: string;
}

export function createSession(userId: string): { id: string; expiresAt: number } {
  const id = jwt.sign({ sub: userId } satisfies SessionClaims, env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return { id, expiresAt: Date.now() + SESSION_TTL_MS };
}

export function getSessionUserId(id: string | undefined): string | null {
  if (!id) return null;
  try {
    const payload = jwt.verify(id, env.JWT_SECRET) as SessionClaims;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, userId: string): void {
  const session = createSession(userId);
  res.cookie(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function destroySession(_id: string | undefined): void {
  void _id;
}

export function getSessionCookie(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[SESSION_COOKIE];
  return typeof value === "string" ? value : undefined;
}
export function clearSessionCookie(req: Request, res: Response): void {
  destroySession(getSessionCookie(req));
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}
