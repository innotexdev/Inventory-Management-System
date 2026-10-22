export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(
    statusCode: number,
    message: string,
    code = "INTERNAL_ERROR",
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Invalid request", fields?: Record<string, string>) {
    super(400, message, "VALIDATION_ERROR", fields);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

export type BodyParserErrorType =
  "entity.parse.failed" | "entity.too.large" | "entity.verify.failed";

export interface BodyParserError {
  type: BodyParserErrorType;
  message?: string;
  status?: number;
  statusCode?: number;
}

const BODY_PARSER_ERRORS: Record<BodyParserErrorType, () => HttpError> = {
  "entity.parse.failed": () => new ValidationError("Request body is not valid JSON"),
  "entity.too.large": () => new HttpError(413, "Request body is too large", "PAYLOAD_TOO_LARGE"),
  "entity.verify.failed": () => new HttpError(403, "Request body failed verification", "FORBIDDEN"),
};

export function isBodyParserError(err: unknown): err is BodyParserError {
  if (typeof err !== "object" || err === null || !("type" in err)) {
    return false;
  }

  const type = err.type;

  return typeof type === "string" && Object.hasOwn(BODY_PARSER_ERRORS, type);
}

export function toLoggableError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  try {
    return new Error(JSON.stringify(err) ?? String(err));
  } catch {
    return new Error("Unserializable non-Error thrown");
  }
}

export function isPrismaUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
}

export function isPrismaNotFoundError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "P2025";
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;

  if (isBodyParserError(err)) return BODY_PARSER_ERRORS[err.type]();

  if (isPrismaUniqueConstraintError(err)) {
    return new HttpError(409, "Resource already exists", "CONFLICT");
  }

  if (isPrismaNotFoundError(err)) {
    return new NotFoundError();
  }

  return new HttpError(500, "Internal server error");
}
