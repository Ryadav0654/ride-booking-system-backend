/**
 * Stats Controller
 *
 * Thin layer for driver stats retrieval.
 */

import type { Response } from "express";
import type { AuthRequest } from "../types/types.d.js";
import * as statsService from "../services/stats.service.js";

// GET /api/v1/drivers/me/stats

/**
 * Returns the authenticated driver's performance statistics.
 *
 * Response 200:
 *   {
 *     success: true,
 *     message: "...",
 *     data: {
 *       totalTrips: number,
 *       completedTrips: number,
 *       cancelledTrips: number,
 *       averageRating: string   // Decimal serialised as string e.g. "4.87"
 *     }
 *   }
 *
 * Errors:
 *   404 DRIVER_NOT_FOUND
 */

export const getStatsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const stats = await statsService.getStats(userId);

  res.status(200).json({
    success: true,
    message: "Driver stats fetched successfully",
    data: stats,
  });
};
