import { AppError } from "./app-error.js";

// Trip Errors
export class TripNotFoundError extends AppError {
  constructor(id?: string) {
    super(
      404,
      id ? `Trip with id "${id}" not found` : "Trip not found",
      "TRIP_NOT_FOUND"
    );
  }
}

export class InvalidTripStatusError extends AppError {
  constructor(message: string) {
    super(400, message, "INVALID_TRIP_STATUS");
  }
}

export class TripAlreadyCancelledError extends AppError {
  constructor() {
    super(400, "Trip has already been cancelled", "TRIP_ALREADY_CANCELLED");
  }
}

export class TripAlreadyCompletedError extends AppError {
  constructor() {
    super(400, "Trip has already been completed", "TRIP_ALREADY_COMPLETED");
  }
}

export class InvalidDriverError extends AppError {
  constructor(message = "Invalid driver for this trip") {
    super(400, message, "INVALID_DRIVER");
  }
}

export class DriverAlreadyAssignedError extends AppError {
  constructor() {
    super(
      400,
      "A driver has already been assigned to this trip",
      "DRIVER_ALREADY_ASSIGNED"
    );
  }
}

// Auth / General
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super(401, "Invalid or expired token", "INVALID_TOKEN");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, message, "FORBIDDEN");
  }
}
