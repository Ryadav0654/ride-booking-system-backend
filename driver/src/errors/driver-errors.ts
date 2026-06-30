import { AppError } from "./app-error.js";

// Driver
export class DriverNotFoundError extends AppError {
  constructor(id?: string) {
    super(
      404,
      id ? `Driver with id "${id}" not found` : "Driver not found",
      "DRIVER_NOT_FOUND"
    );
  }
}

export class DriverAlreadyExistsError extends AppError {
  constructor() {
    super(
      409,
      "A driver profile already exists for this user",
      "DRIVER_ALREADY_EXISTS"
    );
  }
}

// Vehicle
export class VehicleNotFoundError extends AppError {
  constructor(id?: string) {
    super(
      404,
      id ? `Vehicle with id "${id}" not found` : "Vehicle not found",
      "VEHICLE_NOT_FOUND"
    );
  }
}

export class VehicleAlreadyExistsError extends AppError {
  constructor(registrationNumber: string) {
    super(
      409,
      `Vehicle with registration number "${registrationNumber}" already exists`,
      "VEHICLE_ALREADY_EXISTS"
    );
  }
}

export class VehicleOwnershipError extends AppError {
  constructor() {
    super(
      403,
      "You do not have permission to modify this vehicle",
      "VEHICLE_OWNERSHIP_ERROR"
    );
  }
}

// Document
export class DocumentNotFoundError extends AppError {
  constructor(id?: string) {
    super(
      404,
      id ? `Document with id "${id}" not found` : "Document not found",
      "DOCUMENT_NOT_FOUND"
    );
  }
}

// Availability
export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      422,
      `Status transition from "${from}" to "${to}" is not allowed`,
      "INVALID_STATUS_TRANSITION"
    );
  }
}

export class DriverNotVerifiedError extends AppError {
  constructor() {
    super(
      403,
      "Driver must be verified before going online",
      "DRIVER_NOT_VERIFIED"
    );
  }
}

// Auth
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
