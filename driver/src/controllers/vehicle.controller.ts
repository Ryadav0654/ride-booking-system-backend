import type { Response } from "express";
import type { AuthRequest } from "../types/types.d";
import * as vehicleService from "../services/vehicle.service";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from "../validators/driver.schema";

export const addVehicleController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const data = createVehicleSchema.parse(req.body);
  const vehicle = await vehicleService.addVehicle(userId, data);

  res.status(201).json({
    success: true,
    message: "Vehicle added successfully",
    data: vehicle,
  });
};

export const getVehiclesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const vehicles = await vehicleService.getVehicles(userId);

  res.status(200).json({
    success: true,
    message: "Vehicles fetched successfully",
    data: vehicles,
  });
};

export const updateVehicleController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { vehicleId } = vehicleIdParamSchema.parse(req.params);
  const data = updateVehicleSchema.parse(req.body);
  const vehicle = await vehicleService.updateVehicle(userId, vehicleId, data);

  res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: vehicle,
  });
};

export const deleteVehicleController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;
  const { vehicleId } = vehicleIdParamSchema.parse(req.params);
  await vehicleService.deleteVehicle(userId, vehicleId);

  res.status(200).json({
    success: true,
    message: "Vehicle deleted successfully",
    data: null,
  });
};
