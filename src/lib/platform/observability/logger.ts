export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  traceId?: string;
  module?: string;
  [key: string]: string | number | boolean | undefined;
}

function shouldLog(level: LogLevel): boolean {
  const env = process.env.LOG_LEVEL || "info";
  const order: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };
  return order[level] >= order[env as LogLevel];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldLog(level)) return;
  const payload = formatMessage(level, message, context);
  if (level === "error") {
    console.error(payload);
    return;
  }
  if (level === "warn") {
    console.warn(payload);
    return;
  }
  console.log(payload);
}
