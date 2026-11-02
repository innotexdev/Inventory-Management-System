import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";
import { TooManyRequestsError } from "../lib/errors";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function loginRateLimitKey(req: Request): string {
  const body: unknown = req.body;
  if (
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
  ) {
    return body.email;
  }
  return ipKeyGenerator(req.ip ?? "");
}

export const loginRateLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: loginRateLimitKey,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError());
  },
});
