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
    Object.setPrototypeOf(this, new.target.prototype);
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

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Resource already exists") {
    super(409, message, "CONFLICT");
  }
}

export class GoneError extends HttpError {
  constructor(message = "Resource is no longer available") {
    super(410, message, "GONE");
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message = "Payload too large") {
    super(413, message, "PAYLOAD_TOO_LARGE");
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "Unprocessable entity") {
    super(422, message, "UNPROCESSABLE_ENTITY");
  }
}

export class TooManyRequestsError extends HttpError {
  readonly retryAfterSeconds?: number;

  constructor(message = "Too many requests", retryAfterSeconds?: number) {
    super(429, message, "TOO_MANY_REQUESTS");
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal server error") {
    super(500, message, "INTERNAL_ERROR");
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service temporarily unavailable") {
    super(503, message, "SERVICE_UNAVAILABLE");
  }
}

export type BodyParserErrorType =
  | "entity.parse.failed"
  | "entity.too.large"
  | "entity.verify.failed"
  | "encoding.unsupported"
  | "charset.unsupported"
  | "request.aborted"
  | "request.size.invalid"
  | "parameters.too.many";

export interface BodyParserError {
  type: BodyParserErrorType;
  message?: string;
  status?: number;
  statusCode?: number;
}

const BODY_PARSER_ERRORS: Record<BodyParserErrorType, () => HttpError> = {
  "entity.parse.failed": () => new ValidationError("Request body is not valid JSON"),
  "entity.too.large": () => new PayloadTooLargeError("Request body is too large"),
  "entity.verify.failed": () => new ForbiddenError("Request body failed verification"),
  "encoding.unsupported": () =>
    new HttpError(415, "Unsupported content encoding", "UNSUPPORTED_MEDIA_TYPE"),
  "charset.unsupported": () => new HttpError(415, "Unsupported charset", "UNSUPPORTED_MEDIA_TYPE"),
  "request.aborted": () => new ValidationError("Request was aborted before it completed"),
  "request.size.invalid": () => new ValidationError("Invalid request size"),
  "parameters.too.many": () => new PayloadTooLargeError("Too many parameters"),
};

export function isBodyParserError(err: unknown): err is BodyParserError {
  if (typeof err !== "object" || err === null) {
    return false;
  }

  if (!Object.hasOwn(err, "type")) {
    return false;
  }

  const type = (err as { type?: unknown }).type;

  return typeof type === "string" && Object.hasOwn(BODY_PARSER_ERRORS, type);
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (isBodyParserError(err)) return BODY_PARSER_ERRORS[err.type]();
  return new InternalServerError();
}

export function isPrismaUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

export function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2025"
  );
}
