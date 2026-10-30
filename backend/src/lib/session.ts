import jwt from "jsonwebtoken";
import { CookieOptions, Request, Response } from "express";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";

export const SESSION_COOKIE = "sid";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

interface SessionClaims {
  sub: string;
}

export function createSession(userId: string): string {
  return jwt.sign({ sub: userId } satisfies SessionClaims, env.JWT_SECRET, {
    expiresIn: SESSION_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export function getSessionUserId(token: string | undefined): string | null {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    return typeof payload !== "string" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, userId: string): void {
  const token = createSession(userId);

  res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
}

export function getSessionCookie(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[SESSION_COOKIE];

  return typeof value === "string" ? value : undefined;
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
}
