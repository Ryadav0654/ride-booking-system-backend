import * as z from "zod";

export const vehicleTypeSchema = z.enum([
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "AUTO_RICKSHAW",
  "BIKE",
  "LUXURY",
  "MINIVAN",
]);

export const vehicleStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "ACTIVE",
  "INACTIVE",
  "REJECTED",
]);

export const documentTypeSchema = z.enum([
  "DRIVING_LICENSE",
  "VEHICLE_REGISTRATION",
  "VEHICLE_INSURANCE",
  "PAN_CARD",
  "AADHAAR_CARD",
  "PROFILE_PHOTO",
]);

export const availabilityStatusSchema = z.enum(["OFFLINE", "ONLINE", "BUSY"]);

/**
 * POST /api/v1/drivers
 * Creates a new driver profile for the authenticated user.
 */
export const createDriverSchema = z.object({
  licenseNumber: z
    .string()
    .trim()
    .min(5, "License number must be at least 5 characters")
    .max(20, "License number must not exceed 20 characters")
    .regex(
      /^[A-Z0-9-]+$/i,
      "License number must contain only alphanumeric characters and hyphens"
    ),
  licenseExpiry: z
    .string()
    .date("Invalid date — use ISO 8601 format (YYYY-MM-DD)")
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), "License must not be expired"),
});

/**
 * PATCH /api/v1/drivers/me
 * Partially updates driver profile fields.
 */
export const updateDriverSchema = z
  .object({
    licenseNumber: z
      .string()
      .trim()
      .min(5)
      .max(20)
      .regex(/^[A-Z0-9-]+$/i)
      .optional(),
    licenseExpiry: z
      .string()
      .date("Invalid date — use ISO 8601 format (YYYY-MM-DD)")
      .transform((val) => new Date(val))
      .refine((date) => date > new Date(), "License must not be expired")
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

/**
 * POST /api/v1/drivers/me/vehicles
 */
export const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .min(4, "Registration number must be at least 4 characters")
    .max(15, "Registration number must not exceed 15 characters")
    .regex(
      /^[A-Z0-9-\s]+$/i,
      "Registration number must contain only alphanumeric characters, spaces, and hyphens"
    )
    .transform((val) => val.toUpperCase().replace(/\s+/g, " ")),
  make: z.string().trim().min(1).max(50, "Make must not exceed 50 characters"),
  model: z
    .string()
    .trim()
    .min(1)
    .max(50, "Model must not exceed 50 characters"),
  color: z
    .string()
    .trim()
    .min(1)
    .max(30, "Color must not exceed 30 characters"),
  year: z
    .number()
    .int("Year must be an integer")
    .min(1990, "Year must be 1990 or later")
    .max(
      new Date().getFullYear() + 1,
      `Year must not exceed ${new Date().getFullYear() + 1}`
    ),
  vehicleType: vehicleTypeSchema,
});

/**
 * PATCH /api/v1/drivers/me/vehicles/:vehicleId
 */
export const updateVehicleSchema = z
  .object({
    make: z.string().trim().min(1).max(50).optional(),
    model: z.string().trim().min(1).max(50).optional(),
    color: z.string().trim().min(1).max(30).optional(),
    year: z
      .number()
      .int()
      .min(1990)
      .max(new Date().getFullYear() + 1)
      .optional(),
    vehicleType: vehicleTypeSchema.optional(),
    status: vehicleStatusSchema.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

/**
 * POST /api/v1/drivers/me/documents
 */
export const uploadDocumentSchema = z.object({
  documentType: documentTypeSchema,
  documentUrl: z
    .url("Document URL must be a valid URL")
    .max(2048, "URL must not exceed 2048 characters"),
});

/**
 * PATCH /api/v1/drivers/me/status
 */
export const updateAvailabilitySchema = z.object({
  status: availabilityStatusSchema,
});

export const vehicleIdParamSchema = z.object({
  vehicleId: z.uuid("vehicleId must be a valid UUID"),
});
