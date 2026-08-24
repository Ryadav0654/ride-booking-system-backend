import express, { type Express } from "express";
import driverRouter from "./src/routes/driver.routes.js";
import { globalErrorHandler } from "./src/middlewares/error.middleware.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/drivers", driverRouter);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Driver Service is healthy",
    timestamp: new Date().toISOString(),
  });
});


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found",
    error: { code: "NOT_FOUND" },
  });
});

app.use(globalErrorHandler);

export default app;
