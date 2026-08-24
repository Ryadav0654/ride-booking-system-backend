import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import { logger } from "../utils/logger.js";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ZodError is thrown by schema.parse()
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // Domain & Operational Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    });
    return;
  }

  // Prisma Database Known Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.["target"] as string[] | undefined)?.join(", ");
      res.status(409).json({
        success: false,
        message: fields
          ? `Unique constraint violation on: ${fields}`
          : "Resource already exists",
        error: { code: "DUPLICATE_RESOURCE" },
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
        error: { code: "RECORD_NOT_FOUND" },
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Database request failed",
      error: { code: "DATABASE_ERROR" },
    });
    return;
  }

  // Prisma DB initialization error
  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message: "Database connection unavailable. Please try again later.",
      error: { code: "DATABASE_UNAVAILABLE" },
    });
    return;
  }

  // Unhandled internal errors
  logger.fatal(
    { err, method: req.method, url: req.originalUrl },
    "Unhandled error in Trip Service"
  );

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Our team has been notified.",
    error: { code: "INTERNAL_SERVER_ERROR" },
  });
};
