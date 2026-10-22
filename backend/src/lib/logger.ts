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
  process.env.LOG_LEVEL,
  process.env.NODE_ENV === "production" ? "info" : "debug",
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

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    msg: message,
    ...normalizeMeta(meta),
  };

  const output = level === "warn" || level === "error" ? process.stderr : process.stdout;

  const { timestamp, msg, ...fields } = entry;

  const metadata = Object.entries(fields)
    .filter(([key]) => key !== "level")
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(" ");

  output.write(
    `[${timestamp}] ${level.toUpperCase().padEnd(5)} ${msg}` +
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
