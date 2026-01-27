type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
    [key: string]: unknown;
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

const isDev = process.env.NODE_ENV === "development";

function formatLogEntry(entry: LogEntry): string {
    if (isDev) {
        // Pretty format for development
        const parts = [
            `[${entry.timestamp}]`,
            `[${entry.level.toUpperCase()}]`,
            entry.message,
        ];
        if (entry.context) {
            parts.push(JSON.stringify(entry.context));
        }
        return parts.join(" ");
    }
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
}

function createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
): LogEntry {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
    };

    if (context && Object.keys(context).length > 0) {
        entry.context = context;
    }

    if (error) {
        entry.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return entry;
}

export const logger = {
    debug(message: string, context?: LogContext) {
        if (!isDev) return; // Only log debug in development
        const entry = createLogEntry("debug", message, context);
        console.debug(formatLogEntry(entry));
    },

    info(message: string, context?: LogContext) {
        const entry = createLogEntry("info", message, context);
        console.info(formatLogEntry(entry));
    },

    warn(message: string, context?: LogContext) {
        const entry = createLogEntry("warn", message, context);
        console.warn(formatLogEntry(entry));
    },

    error(message: string, error?: Error | unknown, context?: LogContext) {
        const err = error instanceof Error ? error : undefined;
        const entry = createLogEntry("error", message, context, err);
        console.error(formatLogEntry(entry));
    },
};

export default logger;
