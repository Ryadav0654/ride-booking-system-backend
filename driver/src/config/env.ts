/**
 * Environment Configuration
 *
 * Validates all required environment variables at startup using a fail-fast
 * pattern. If any variable is missing, the process exits with a clear error
 * message rather than failing silently at runtime.
 */

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env["PORT"] ?? "3001", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",

  accessTokenSecret: requireEnv("JWT_SECRET"),

  databaseUrl: requireEnv("DATABASE_URL"),
} as const;
