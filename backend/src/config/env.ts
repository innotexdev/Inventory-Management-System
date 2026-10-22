import "dotenv/config";

function requiredString(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
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

export const env = {
  DATABASE_URL: requiredString("DATABASE_URL"),
  PORT: positiveInteger("PORT", 5000),
} as const;
