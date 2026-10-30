import { NextFunction, Request, Response } from "express";
import type { Prisma } from "../generated/client";
import { prisma } from "../lib/prisma";
import { AuthenticationError } from "../lib/errors";
import { authUserSelect } from "../services/auth.service";
import { clearSessionCookie, getSessionCookie, getSessionUserId } from "../lib/session";

export type AuthenticatedUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

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
      clearSessionCookie(res);
      throw new AuthenticationError("Not authenticated");
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    next(err);
  }
}
