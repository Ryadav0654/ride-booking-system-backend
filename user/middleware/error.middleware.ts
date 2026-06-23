import type {
  Request,
  Response,
  NextFunction,
} from "express";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      reqId: req.id,
      error: {
        code: "VALIDATION_ERROR",
        details: err.issues.map(issue => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
      },
    });
  }

  if (
    err instanceof Prisma.PrismaClientKnownRequestError
  ) {

    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Resource already exists",
        reqId: req.id,
        error: {
          code: "DUPLICATE_RESOURCE",
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Database request failed",
      reqId: req.id,
      error: {
        code: "DATABASE_ERROR",
      },
    });
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError
  ) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable",
      reqId: req.id,
      error: {
        code: "DATABASE_UNAVAILABLE",
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    reqId: req.id,
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
};