const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env["PORT"] ?? "3000", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",

  accessTokenSecret: requireEnv("JWT_SECRET"),
  refreshTokenSecret: requireEnv("JWT_SECRET"),

  databaseUrl: requireEnv("DATABASE_URL"),
} as const;
