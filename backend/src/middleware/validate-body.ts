import type { RequestHandler } from "express";
import type { z } from "zod";
import { ValidationError } from "../lib/errors";

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

export function parseWith<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    fields[String(issue.path[0] ?? "body")] ??= issue.message;
  }
  throw new ValidationError("Some fields are invalid", fields);
}
