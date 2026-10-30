import type { RequestHandler } from "express";
import type { z } from "zod";
import { parseWith } from "../validation/auth.validation";

export const validateBody =
  <T extends z.ZodType>(schema: T): RequestHandler =>
  (req, _res, next) => {
    try {
      req.body = parseWith(schema, req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
