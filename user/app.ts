import express, { type Express } from "express";
import pinoHttp from "pino-http";
import authRouter from "./routers/auth.router";
import userRouter from "./routers/user.router";
import { globalErrorHandler } from "./middleware/error.middleware";

const app: Express = express();
const logger = pinoHttp();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(logger);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users/me", userRouter);

app.get("/api/v1/health", (_req, res) => {
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

app.use(globalErrorHandler);

export default app;
