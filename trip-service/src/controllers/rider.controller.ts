import type { Response } from "express";
import type { AuthRequest } from "../types/types.js";
import { ActorRole } from "../../generated/prisma/client.js";
import * as tripService from "../services/trip.service.js";
import {
  createTripSchema,
  getTripSchema,
  cancelTripSchema,
  paginationSchema,
} from "../validators/trip.validator.js";

export async function createTrip(req: AuthRequest, res: Response) {
  const { body } = createTripSchema.parse({ body: req.body });
  const riderId = req.user!.id;
  const trip = await tripService.createTripService({
    riderId,
    ...body,
  });

  return res.status(201).json({
    success: true,
    message: "Trip created successfully",
    data: trip,
  });
}

export async function getTrip(req: AuthRequest, res: Response) {
  const { params } = getTripSchema.parse({ params: req.params });
  const userId = req.user!.id;
  const role = req.user!.role;
  const trip = await tripService.getTripService(params.tripId, userId, role);

  return res.status(200).json({
    success: true,
    message: "Trip retrieved successfully",
    data: trip,
  });
}

export async function getMyTrips(req: AuthRequest, res: Response) {
  const { query } = paginationSchema.parse({ query: req.query });
  const riderId = req.user!.id;
  const offset = (query.page - 1) * query.limit;

  const trips = await tripService.getRiderTripsService(
    riderId,
    query.limit,
    offset
  );

  return res.status(200).json({
    success: true,
    message: "Rider trips retrieved successfully",
    data: trips,
  });
}

export async function cancelTrip(req: AuthRequest, res: Response) {
  const { params, body } = cancelTripSchema.parse({
    params: req.params,
    body: req.body,
  });
  const userId = req.user!.id;
  const role = req.user!.role;

  const result = await tripService.cancelTripService(
    params.tripId,
    ActorRole.RIDER,
    userId,
    body.reason,
    role
  );

  return res.status(200).json({
    success: true,
    message: "Trip cancelled successfully",
    data: result,
  });
}
