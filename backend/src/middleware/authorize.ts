import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "./require-auth";
import { AuthenticationError, ForbiddenError } from "../lib/errors";
import { Role } from "../generated/enums";

const RANK: Record<Role, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export const hasMinRole = (role: Role, minRole: Role): boolean => RANK[role] >= RANK[minRole];

export const authorize = (minRole: Role) => (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as Partial<AuthenticatedRequest>).user;
  if (!user) {
    return next(new AuthenticationError());
  }
  if (!hasMinRole(user.role, minRole)) {
    return next(new ForbiddenError());
  }
  next();
};
