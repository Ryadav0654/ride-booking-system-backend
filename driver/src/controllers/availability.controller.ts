/**
 * Availability Controller
 *
 * Thin layer for the driver status update endpoint.
 */

import type { Response } from "express";
import type { AuthRequest } from "../types/types.d";
import * as availabilityService from "../services/availability.service";
import { updateAvailabilitySchema } from "../validators/driver.schema";

// PATCH /api/v1/drivers/me/status

/**
 * Updates the authenticated driver's availability status.
 * Enforces FSM transitions (see availability.service.ts).
 *
 * Request body:
 *   { status: "OFFLINE" | "ONLINE" | "BUSY" }
 *
 * Response 200:
 *   { success: true, message: "...", data: AvailabilityResponseDto }
 *
 * Errors:
 *   404 DRIVER_NOT_FOUND
 *   403 DRIVER_NOT_VERIFIED   — driver must be VERIFIED to go ONLINE
 *   422 INVALID_STATUS_TRANSITION — e.g. OFFLINE → BUSY
 */

export const updateStatusController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = updateAvailabilitySchema.parse(req.body);
  const availability = await availabilityService.updateStatus(userId, data);

  res.status(200).json({
    success: true,
    message: `Driver status updated to ${data.status}`,
    data: availability,
  });
};
