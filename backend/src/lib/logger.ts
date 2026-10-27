import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error" | "silent";
type LogMeta = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 90,
};

function parseLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = value?.toLowerCase();

  if (
    normalized === "debug" ||
    normalized === "info" ||
    normalized === "warn" ||
    normalized === "error" ||
    normalized === "silent"
  ) {
    return normalized;
  }

  return fallback;
}

const LOG_LEVEL = parseLevel(
  env.LOG_LEVEL,
  env.NODE_ENV === "production" ? "info" : "debug",
);

function normalizeMeta(meta?: unknown): LogMeta {
  if (meta instanceof Error) {
    return {
      err: {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      },
    };
  }

  if (meta !== null && typeof meta === "object" && !Array.isArray(meta)) {
    return { ...meta };
  }

  return meta === undefined ? {} : { data: meta };
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function writeLog(level: Exclude<LogLevel, "silent">, message: string, meta?: unknown): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[LOG_LEVEL]) return;

  const timestamp = new Date().toISOString();
  const metaObj = normalizeMeta(meta);

  const metadata = Object.entries(metaObj)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(" ");

  const output = level === "warn" || level === "error" ? process.stderr : process.stdout;

  output.write(
    `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${message}` +
      (metadata ? ` ${metadata}` : "") +
      "\n",
  );
}

export const logger = {
  debug: (message: string, meta?: unknown): void => writeLog("debug", message, meta),

  info: (message: string, meta?: unknown): void => writeLog("info", message, meta),

  warn: (message: string, meta?: unknown): void => writeLog("warn", message, meta),

  error: (message: string, meta?: unknown): void => writeLog("error", message, meta),
};
