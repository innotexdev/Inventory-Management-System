import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "./require-auth";
import { AuthenticationError, ForbiddenError } from "../lib/errors";
import { Role } from "../generated/enums";

const RANK: Record<Role, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export const authorize = (...allowedRoles: Role[]) => {
  const requiredRank = Math.min(...allowedRoles.map((r) => RANK[r]));

  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as Partial<AuthenticatedRequest>).user;

    if (!user) {
      return next(new AuthenticationError());
    }

    if (RANK[user.role] < requiredRank) {
      return next(new ForbiddenError());
    }

    next();
  };
};
