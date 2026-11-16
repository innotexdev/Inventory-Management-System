import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../lib/errors";

export const validateUuidParam =
  (name: string): RequestHandler =>
  (req, _res, next) => {
    const value = (req.params as Record<string, unknown>)[name];
    const result = z.uuid().safeParse(value);

    if (!result.success) {
      next(new ValidationError("Invalid id", { [name]: "Invalid id" }));
      return;
    }

    next();
  };
