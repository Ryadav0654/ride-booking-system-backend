import * as z from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(64, "Name must not exceed 64 characters")
      .optional(),
    email: z
      .email("Invalid email address")
      .trim()
      .toLowerCase()
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{6,14}$/, "Phone must be in E.164 format (e.g. +919876543210)")
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field (name, email, phone) must be provided" },
  );

export const updateProfileSchema = z
  .object({
    dob: z
      .string()
      .date("Invalid date — use ISO 8601 format (YYYY-MM-DD)")
      .transform((val) => new Date(val))
      .optional(),
    gender: z
      .enum(["MALE", "FEMALE", "OTHER"], {
        error: "Gender must be MALE, FEMALE, or OTHER",
      })
      .optional(),
    profileImageUrl: z
      .url("Invalid URL for profile image")
      .optional(),
    preferredLanguage: z
      .string()
      .trim()
      .min(2, "Language code must be at least 2 characters")
      .max(10, "Language code must not exceed 10 characters")
      .optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one profile field must be provided" },
  );

export const registerDeviceSchema = z.object({
  deviceId: z.uuidv4("deviceId must be a valid UUID v4"),
  deviceToken: z
    .string()
    .trim()
    .min(1, "deviceToken must not be empty")
    .max(512, "deviceToken is too long"),
  deviceType: z
    .string()
    .trim()
    .min(1, "deviceType must not be empty")
    .max(32, "deviceType must not exceed 32 characters"),
});

export const deviceIdParamSchema = z.object({
  deviceId: z.uuidv4("deviceId must be a valid UUID v4"),
});
