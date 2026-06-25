/**
 * Global Error Handler
 *
 * Central error middleware — the last middleware in the Express chain.
 * Handles all errors thrown from controllers/services and converts them
 * into standardised API responses.
 *
 * Error processing order (most specific → least specific):
 *   1. ZodError          → 400 VALIDATION_ERROR (with field-level details)
 *   2. AppError          → appropriate status + code from the error instance
 *   3. Prisma P2002      → 409 DUPLICATE_RESOURCE (unique constraint violation)
 *   4. Prisma init error → 503 DATABASE_UNAVAILABLE
 *   5. Unknown           → 500 INTERNAL_SERVER_ERROR (logged as critical)
 *
 * Standard response format:
 *
 *   Success: { success: true,  message: string, data: T }
 *   Error:   { success: false, message: string, error: { code: string, details?: [] } }
 */

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ZodError is thrown synchronously by schema.parse() in controllers.
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

  // Application / Domain Errors (AppError + subclasses)
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

  // Prisma Known Request Errors
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

    // P2025 = record not found (e.g. update/delete on missing row)
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

  // 4. Prisma Initialisation Errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message: "Database connection unavailable. Please try again later.",
      error: { code: "DATABASE_UNAVAILABLE" },
    });
    return;
  }

  // Unhandled / Programming Errors — log and return generic 500
  console.error("[CRITICAL] Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Our team has been notified.",
    error: { code: "INTERNAL_SERVER_ERROR" },
  });
};
