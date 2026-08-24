import pino from "pino";
import { config } from "../config/env.js";

/**
 * Application Logger
 *
 * Centralised Pino logger instance used across the entire Trip Service.
 *
 * Design decisions:
 * - `level` is tied to NODE_ENV: "debug" in development for verbose output,
 *   "info" in production to reduce log volume.
 * - `transport.target: "pino-pretty"` is only enabled in development for
 *   human-readable logs. In production, raw JSON is emitted so that log
 *   aggregators (ELK, Datadog, CloudWatch) can parse and index efficiently.
 * - `name: "trip-service"` tags every log line, making it trivial to filter
 *   this service's logs in a multi-service cluster.
 */
export const logger = pino({
  name: "trip-service",
  level: config.nodeEnv === "production" ? "info" : "debug",
  ...(config.nodeEnv !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    },
  }),
});
