import type { Response } from "express";
import type { AuthRequest } from "../types/types.js";
import * as tripService from "../services/trip.service.js";
import {
  driverTripActionSchema,
  completeTripSchema,
} from "../validators/trip.validator.js";

export async function acceptTrip(req: AuthRequest, res: Response) {
  const { params } = driverTripActionSchema.parse({ params: req.params });
  const driverId = req.user!.id;
  const trip = await tripService.acceptTripService(params.tripId, driverId);

  return res.status(200).json({
    success: true,
    message: "Trip accepted successfully",
    data: trip,
  });
}

export async function rejectTrip(req: AuthRequest, res: Response) {
  const { params } = driverTripActionSchema.parse({ params: req.params });
  const driverId = req.user!.id;
  const trip = await tripService.rejectTripService(params.tripId, driverId);

  return res.status(200).json({
    success: true,
    message: "Trip rejected successfully",
    data: trip,
  });
}

export async function arrivedAtPickup(req: AuthRequest, res: Response) {
  const { params } = driverTripActionSchema.parse({ params: req.params });
  const driverId = req.user!.id;
  const trip = await tripService.arrivedAtPickupService(
    params.tripId,
    driverId
  );

  return res.status(200).json({
    success: true,
    message: "Driver arrived at pickup location",
    data: trip,
  });
}

export async function startTrip(req: AuthRequest, res: Response) {
  const { params } = driverTripActionSchema.parse({ params: req.params });
  const driverId = req.user!.id;
  const trip = await tripService.startTripService(params.tripId, driverId);

  return res.status(200).json({
    success: true,
    message: "Trip started successfully",
    data: trip,
  });
}

export async function completeTrip(req: AuthRequest, res: Response) {
  const { params, body } = completeTripSchema.parse({
    params: req.params,
    body: req.body,
  });
  const driverId = req.user!.id;
  const trip = await tripService.completeTripService(
    params.tripId,
    driverId,
    body?.finalFare
  );

  return res.status(200).json({
    success: true,
    message: "Trip completed successfully",
    data: trip,
  });
}
