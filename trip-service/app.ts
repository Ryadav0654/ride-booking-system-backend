import express, { type Express } from "express";
import pinoHttp from "pino-http";
import riderRoutes from "./src/routes/rider.routes.js";
import driverRoutes from "./src/routes/driver.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { globalErrorHandler } from "./src/middlewares/error.middleware.js";
import { logger } from "./src/utils/logger.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Structured HTTP request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/api/v1/health",
    },
  })
);

app.use("/api/v1/rider/trips", riderRoutes);
app.use("/api/v1/driver/trips", driverRoutes);
app.use("/api/v1/admin/trips", adminRoutes);

app.get("/api/v1/health", (_req, res) => {
  console.log("health check");
  return res
    .status(200)
    .json({ message: "healthy", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found",
    error: { code: "NOT_FOUND" },
  });
});

// Global Error Handler middleware
app.use(globalErrorHandler);

export default app;
