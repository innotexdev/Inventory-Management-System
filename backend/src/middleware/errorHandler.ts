import { ErrorRequestHandler } from "express";
import { isBodyParserError, toHttpError } from "../lib/errors";
import { logger } from "../lib/logger";

function toLoggableError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  try {
    return new Error(JSON.stringify(err) ?? String(err));
  } catch {
    return new Error("Unserializable non-Error thrown");
  }
}

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const error = toHttpError(err);

  if (error.statusCode >= 500) {
    logger.error("Unhandled error", toLoggableError(err));
  } else {
    logger.warn("Client error", {
      code: error.code,
      message: error.message,
      ...(isBodyParserError(err) ? { type: err.type } : {}),
    });
  }

  res.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    },
  });
};
