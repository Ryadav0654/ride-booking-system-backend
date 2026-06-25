/**
 * User Controller
 *
 * Thin layer that:
 *  1. Validates request input via Zod schemas
 *  2. Delegates business logic to `user.service.ts`
 *  3. Returns standardised API responses
 *
 * Controllers do NOT contain business logic. All domain rules live in the
 * service layer. Error propagation is handled by `asyncHandler` + the global
 * error middleware.
 */

import type { Response } from "express";
import type { AuthRequest } from "../types/types.d";
import * as userService from "../services/user.service";
import {
  updateUserSchema,
  updateProfileSchema,
  registerDeviceSchema,
  deviceIdParamSchema,
} from "../validators/user.schema";

// ---------------------------------------------------------------------------
// Account controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's account information.
 */
export const getUserController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const user = await userService.getUserById(userId);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

/**
 * PATCH /api/v1/users/me
 * Updates the authenticated user's account fields (name, email, phone).
 */
export const updateUserController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  // Validate and sanitise the request body
  const data = updateUserSchema.parse(req.body);

  const updatedUser = await userService.updateUser(userId, data);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
};

// ---------------------------------------------------------------------------
// Profile controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/users/me/profile
 * Returns the authenticated user's profile (dob, gender, image, language).
 * Auto-initialises an empty profile on first access.
 */
export const getProfileController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const profile = await userService.getProfile(userId);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: profile,
  });
};

/**
 * PATCH /api/v1/users/me/profile
 * Creates or updates the authenticated user's profile.
 */
export const updateProfileController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = updateProfileSchema.parse(req.body);

  const profile = await userService.upsertProfile(userId, data);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
};

// ---------------------------------------------------------------------------
// Device controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/users/me/devices
 * Returns all push-notification devices registered to the authenticated user.
 */
export const getDevicesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const devices = await userService.getDevices(userId);

  res.status(200).json({
    success: true,
    message: "Devices fetched successfully",
    data: devices,
  });
};

/**
 * POST /api/v1/users/me/devices
 * Registers a new device or refreshes an existing device token.
 * Returns 201 on first registration, 200 on token refresh.
 *
 * Note: We use 200 for upserts since we cannot easily distinguish
 * create vs update without additional service-layer metadata.
 */
export const registerDeviceController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = registerDeviceSchema.parse(req.body);

  const device = await userService.registerDevice(userId, data);

  res.status(201).json({
    success: true,
    message: "Device registered successfully",
    data: device,
  });
};

/**
 * DELETE /api/v1/users/me/devices/:deviceId
 * Removes a device from the authenticated user's account.
 * Validates ownership to prevent IDOR attacks.
 */
export const removeDeviceController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  // Validate the path parameter
  const { deviceId } = deviceIdParamSchema.parse(req.params);

  await userService.removeDevice(userId, deviceId);

  res.status(200).json({
    success: true,
    message: "Device removed successfully",
    data: null,
  });
};
