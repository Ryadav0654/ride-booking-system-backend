import { BaseError } from "./base-error.js";

/**
 * AppError
 *
 * Generic operational error for cases that don't have a dedicated subclass.
 * Use domain-specific errors (trip-errors.ts) where possible for
 * consistent error codes across the service.
 */
export class AppError extends BaseError {
  constructor(statusCode: number, message: string, code: string) {
    super(statusCode, message, code);
  }
}
