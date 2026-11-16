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

export class AuthenticationError extends HttpError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, message, "FORBIDDEN");
  }
}

export class DuplicateEmailError extends HttpError {
  constructor() {
    super(409, "Email is already in use", "CONFLICT", { email: "Email is already in use" });
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = "Request limit exceeded") {
    super(429, message, "TOO_MANY_REQUESTS");
  }
}

export class DuplicateSerialNumberError extends HttpError {
  constructor() {
    super(409, "Serial number is already in use", "CONFLICT", {
      serialNumber: "Serial number is already in use",
    });
  }
}

export class ItemConflictError extends HttpError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

export type BodyParserErrorType = "entity.parse.failed" | "entity.too.large";

const BODY_PARSER_ERRORS: Record<BodyParserErrorType, () => HttpError> = {
  "entity.parse.failed": () => new ValidationError("Request body is not valid JSON"),
  "entity.too.large": () => new HttpError(413, "Request body is too large", "PAYLOAD_TOO_LARGE"),
};

export function isBodyParserError(err: unknown): err is { type: BodyParserErrorType } {
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

function hasPrismaCode(err: unknown, code: "P2002" | "P2025"): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === code;
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;

  if (isBodyParserError(err)) return BODY_PARSER_ERRORS[err.type]();

  if (hasPrismaCode(err, "P2002")) {
    return new HttpError(409, "Resource already exists", "CONFLICT");
  }

  if (hasPrismaCode(err, "P2025")) {
    return new NotFoundError();
  }

  return new HttpError(500, "Internal server error");
}

export function isUniqueViolation(err: unknown): boolean {
  return hasPrismaCode(err, "P2002");
}

export function isRecordNotFound(err: unknown): boolean {
  return hasPrismaCode(err, "P2025");
}
