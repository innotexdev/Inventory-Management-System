import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { AuthenticatedRequest } from "../middleware/require-auth";
import { parseWith } from "../middleware/validate-body";
import {
  changeItemStatus,
  createItem,
  getInventoryStats,
  getItem,
  listCategories,
  listItemAssignments,
  listItems,
  updateItem,
} from "../services/inventory.service";
import {
  ChangeItemStatusInput,
  CreateItemInput,
  itemQuerySchema,
  UpdateItemInput,
} from "../validation/inventory.validation";

export async function listItemsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = parseWith(itemQuerySchema, req.query);
    res.json(await listItems(query));
  } catch (err) {
    next(err);
  }
}

export async function getItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getItem(String(req.params.id)) });
  } catch (err) {
    next(err);
  }
}

export async function createItemHandler(
  req: Request<ParamsDictionary, unknown, CreateItemInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(201).json({ data: await createItem(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function updateItemHandler(
  req: Request<ParamsDictionary, unknown, UpdateItemInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({ data: await updateItem(String(req.params.id), req.body) });
  } catch (err) {
    next(err);
  }
}

export async function changeItemStatusHandler(
  req: Request<ParamsDictionary, unknown, ChangeItemStatusInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as AuthenticatedRequest).user;
    res.json({ data: await changeItemStatus(String(req.params.id), req.body, user.role) });
  } catch (err) {
    next(err);
  }
}

export async function listItemAssignmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await listItemAssignments(String(req.params.id)) });
  } catch (err) {
    next(err);
  }
}

export async function listCategoriesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await listCategories() });
  } catch (err) {
    next(err);
  }
}

export async function getInventoryStatsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await getInventoryStats() });
  } catch (err) {
    next(err);
  }
}
