import { BaseError } from "./base-error";
export class AppError extends BaseError {
  constructor(statusCode: number, message: string, code: string) {
    super(statusCode, message, code);
  }
}
