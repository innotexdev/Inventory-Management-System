type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

type LogMeta = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 90,
};

const COLORS: Record<Exclude<LogLevel, "silent">, string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const RESET = "\x1b[0m";

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

function getDefaultLevel(): LogLevel {
  return parseLevel(
    process.env.LOG_LEVEL,
    process.env.NODE_ENV === "production" ? "info" : "debug",
  );
}

function isJsonFormat(): boolean {
  const format = process.env.LOG_FORMAT?.toLowerCase();

  return format ? format === "json" : process.env.NODE_ENV === "production";
}

function useColors(): boolean {
  return (
    !process.env.NO_COLOR &&
    process.env.LOG_FORMAT?.toLowerCase() !== "json" &&
    process.stdout.isTTY === true
  );
}

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

  if (meta !== null && typeof meta === "object") {
    return meta as LogMeta;
  }

  return meta === undefined ? {} : { data: meta };
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;

  try {
    const result = JSON.stringify(value);
    return result ?? String(value);
  } catch {
    return String(value);
  }
}

function writeLog(level: Exclude<LogLevel, "silent">, message: string, meta?: unknown): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[getDefaultLevel()]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    msg: message,
    ...normalizeMeta(meta),
  };

  const output = level === "warn" || level === "error" ? process.stderr : process.stdout;

  if (isJsonFormat()) {
    output.write(`${JSON.stringify({ pid: process.pid, ...entry })}\n`);
    return;
  }

  const color = useColors() ? COLORS[level] : "";
  const reset = color ? RESET : "";

  const { timestamp, msg, ...fields } = entry;
  const metadata = Object.entries(fields)
    .filter(([key]) => key !== "level")
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(" ");

  output.write(
    `[${timestamp}] ${color}${level.toUpperCase().padEnd(5)}${reset} ${msg}` +
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

export type { LogLevel, LogMeta };
