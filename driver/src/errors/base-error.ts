/**
 * BaseError
 *
 * Root of the error class hierarchy.
 * `isOperational` distinguishes expected domain errors (true) from
 * programming bugs (false). The global error handler logs non-operational
 * errors as critical alerts.
 */
export class BaseError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
