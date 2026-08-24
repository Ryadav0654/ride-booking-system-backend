const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env["PORT"] ?? "3002", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  accessTokenSecret: requireEnv("JWT_SECRET"),
  databaseUrl: requireEnv("DATABASE_URL"),
  kafkaBrokers: process.env["KAFKA_BROKERS"]?.split(",") ?? ["localhost:9092"],
  kafkaClientId: process.env["KAFKA_CLIENT_ID"] ?? "trip-service",
} as const;
