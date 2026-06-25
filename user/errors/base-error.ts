export class BaseError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly isOperational = true
  ) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}
