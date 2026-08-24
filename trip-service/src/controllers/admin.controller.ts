import type { Response } from "express";
import type { AuthRequest } from "../types/types.js";
import * as tripService from "../services/trip.service.js";
import { paginationSchema } from "../validators/trip.validator.js";

export async function listAllTrips(req: AuthRequest, res: Response) {
  const { query } = paginationSchema.parse({ query: req.query });
  const offset = (query.page - 1) * query.limit;

  const result = await tripService.getAdminTripsService(query.limit, offset);

  return res.status(200).json({
    success: true,
    message: "All trips retrieved successfully",
    data: result,
  });
}
