import { Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { AuthenticatedRequest } from "../middleware/require-auth";
import { parseWith } from "../middleware/validate-body";
import {
  changePassword,
  getUser,
  listAssignmentsForUser,
  listCurrentItemsForUser,
  listUsers,
  updateUser,
} from "../services/user.service";
import {
  UpdatePasswordInput,
  UpdateUserInput,
  userQuerySchema,
} from "../validation/user.validation";

export async function updateMyInfo(
  req: Request<ParamsDictionary, unknown, UpdateUserInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = (req as AuthenticatedRequest).user;

    const user = await updateUser(id, req.body);

    res.json({ data: user });
  } catch (err: unknown) {
    next(err);
  }
}

export async function changeUserPassword(
  req: Request<ParamsDictionary, unknown, UpdatePasswordInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const result = await changePassword(user.id, req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyItems(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const result = await listCurrentItemsForUser(user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const result = await listAssignmentsForUser(user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function listUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = parseWith(userQuerySchema, req.query);
    res.json(await listUsers(query));
  } catch (err) {
    next(err);
  }
}

export async function getUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getUser(String(req.params.id)) });
  } catch (err) {
    next(err);
  }
}

export async function getUserItemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    await getUser(id);
    res.json({ data: await listCurrentItemsForUser(id) });
  } catch (err) {
    next(err);
  }
}

export async function getUserAssignmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    await getUser(id);
    res.json({ data: await listAssignmentsForUser(id) });
  } catch (err) {
    next(err);
  }
}
