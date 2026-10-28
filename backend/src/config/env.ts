import "dotenv/config";

const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const;
const NODE_ENVS = ["development", "production", "test"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

function requiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

function oneOf<T extends string>(name: string, allowed: readonly T[], defaultValue: T): T {
  const value = process.env[name]?.trim();

  if (!value) {
    return defaultValue;
  }

  const match = allowed.find((option) => option === value);

  if (!match) {
    throw new Error(`Environment variable ${name} must be one of: ${allowed.join(", ")}`);
  }

  return match;
}

function positiveInteger(name: string, defaultValue: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }

  return value;
}

const NODE_ENV = oneOf("NODE_ENV", NODE_ENVS, "development");

export const env = {
  DATABASE_URL: requiredString("DATABASE_URL"),
  NODE_ENV,
  JWT_SECRET: requiredString("JWT_SECRET"),
  BASE_URL: requiredString("BASE_URL"),
  LOG_LEVEL: oneOf("LOG_LEVEL", LOG_LEVELS, NODE_ENV === "production" ? "info" : "debug"),
  PORT: positiveInteger("PORT", 5000),
} as const;
