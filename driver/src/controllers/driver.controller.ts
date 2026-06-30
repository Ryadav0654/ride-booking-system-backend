/**
 * Driver Controller
 *
 * Thin layer — parse request → call service → return response.
 * No business logic. No direct DB access.
 *
 * Every handler is wrapped with asyncHandler in the router so that
 * thrown errors propagate to the global error middleware automatically.
 */

import type { Response } from "express";
import type { AuthRequest } from "../types/types.d";
import * as driverService from "../services/driver.service";
import {
  createDriverSchema,
  updateDriverSchema,
} from "../validators/driver.schema";

// POST /api/v1/drivers

/**
 * Registers a new driver profile for the authenticated user.
 *
 * Request body:
 *   { licenseNumber: string, licenseExpiry: "YYYY-MM-DD" }
 *
 * Response 201:
 *   { success: true, message: "...", data: DriverResponseDto }
 *
 * Errors:
 *   409 DRIVER_ALREADY_EXISTS — user already has a driver profile
 */

export const registerDriverController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = createDriverSchema.parse(req.body);
  const driver = await driverService.registerDriver(userId, data);

  res.status(201).json({
    success: true,
    message: "Driver profile created successfully",
    data: driver,
  });
};

// GET /api/v1/drivers/me

/**
 * Returns the authenticated driver's profile.
 *
 * Response 200:
 *   { success: true, message: "...", data: DriverResponseDto }
 *
 * Errors:
 *   404 DRIVER_NOT_FOUND — no profile yet (user must call POST /drivers first)
 */
export const getDriverController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const driver = await driverService.getDriverByUserId(userId);

  res.status(200).json({
    success: true,
    message: "Driver profile fetched successfully",
    data: driver,
  });
};

// PATCH /api/v1/drivers/me

/**
 * Partially updates the authenticated driver's profile.
 *
 * Request body (at least one field required):
 *   { licenseNumber?: string, licenseExpiry?: "YYYY-MM-DD" }
 *
 * Response 200:
 *   { success: true, message: "...", data: DriverResponseDto }
 *
 * Errors:
 *   404 DRIVER_NOT_FOUND
 *   409 DRIVER_ALREADY_EXISTS — licenseNumber taken by another driver
 */
export const updateDriverController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = updateDriverSchema.parse(req.body);
  const driver = await driverService.updateDriver(userId, data);

  res.status(200).json({
    success: true,
    message: "Driver profile updated successfully",
    data: driver,
  });
};
