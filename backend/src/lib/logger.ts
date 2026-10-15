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
  const normalized = value?.toLowerCase() as LogLevel | undefined;
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
  if (process.env.LOG_LEVEL) return parseLevel(process.env.LOG_LEVEL, "info");
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function isJsonFormat(): boolean {
  const format = process.env.LOG_FORMAT?.toLowerCase();
  if (format) return format === "json";
  return process.env.NODE_ENV === "production";
}

function useColors(): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.LOG_FORMAT?.toLowerCase() === "json") return false;
  return process.stdout.isTTY === true;
}

const COLORS: Record<Exclude<LogLevel, "silent">, string> = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};
const RESET = "\x1b[0m";

function toMeta(value: unknown): LogMeta {
  if (value instanceof Error) {
    return {
      err: {
        name: value.name,
        message: value.message,
        stack: value.stack,
      },
    };
  }
  if (typeof value === "object" && value !== null) {
    return value as LogMeta;
  }
  if (value !== undefined) {
    return { data: value };
  }
  return {};
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export class Logger {
  private context: LogMeta;
  private level: LogLevel;

  constructor(context: LogMeta = {}, level?: LogLevel) {
    this.context = context;
    this.level = level ?? getDefaultLevel();
  }

  child(context: LogMeta): Logger {
    return new Logger({ ...this.context, ...context }, this.level);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, meta?: unknown): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.write("error", message, meta);
  }

  private shouldLog(level: Exclude<LogLevel, "silent">): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  private write(
    level: Exclude<LogLevel, "silent">,
    message: string,
    meta?: unknown,
  ): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const entry: LogMeta = {
      timestamp,
      level,
      msg: message,
      ...this.context,
      ...toMeta(meta),
    };

    if (isJsonFormat()) {
      const line = JSON.stringify({ pid: process.pid, ...entry });
      if (level === "error" || level === "warn") {
        process.stderr.write(`${line}\n`);
      } else {
        process.stdout.write(`${line}\n`);
      }
      return;
    }

    const color = useColors() ? COLORS[level] : "";
    const reset = useColors() ? RESET : "";
    const rest = Object.entries(entry)
      .filter(([key]) => !["timestamp", "level", "msg"].includes(key))
      .map(([key, value]) => `${key}=${formatValue(value)}`)
      .join(" ");
    const line =
      `[${timestamp}] ${color}${level.toUpperCase().padEnd(5)}${reset} ${message}` +
      (rest ? ` ${rest}` : "");

    if (level === "error" || level === "warn") {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }
}

export const logger = new Logger();

export function createLogger(context: LogMeta, level?: LogLevel): Logger {
  return new Logger(context, level);
}

export type { LogLevel, LogMeta };
