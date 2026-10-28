import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticationError } from "../lib/errors";
import { authUserSelect } from "../services/auth.service";
import { SESSION_COOKIE, destroySession, getSessionCookie, getSessionUserId } from "../lib/session";
import { Role } from "../generated/enums";

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  teamId: string | null;
  isActive: boolean;
  createdAt: Date;
  team: { id: string; name: string } | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionCookie(req);
    const userId = getSessionUserId(sessionId);
    if (!userId) {
      throw new AuthenticationError("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: authUserSelect,
    });

    if (!user || !user.isActive) {
      destroySession(sessionId);
      res.clearCookie(SESSION_COOKIE, { path: "/" });
      throw new AuthenticationError("Not authenticated");
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    next(err);
  }
}
