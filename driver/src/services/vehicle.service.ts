import * as vehicleRepo from "../repositories/vehicle.repository.js";
import * as driverRepo from "../repositories/driver.repository.js";
import {
  DriverNotFoundError,
  VehicleAlreadyExistsError,
  VehicleNotFoundError,
} from "../errors/driver-errors.js";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
} from "../types/driver.dto.js";

export async function addVehicle(userId: string, data: CreateVehicleDto) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  // Registration numbers are globally unique across all drivers
  const conflict = await vehicleRepo.findVehicleByRegistrationNumber(
    data.registrationNumber
  );
  if (conflict) throw new VehicleAlreadyExistsError(data.registrationNumber);

  return vehicleRepo.createVehicle(driver.id, data);
}

export async function getVehicles(userId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  return vehicleRepo.findVehiclesByDriverId(driver.id);
}

export async function updateVehicle(
  userId: string,
  vehicleId: string,
  data: UpdateVehicleDto
) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  // Returns null if vehicle doesn't exist OR belongs to a different driver
  const vehicle = await vehicleRepo.findVehicleByIdAndDriver(
    vehicleId,
    driver.id
  );
  if (!vehicle) throw new VehicleNotFoundError(vehicleId);

  return vehicleRepo.updateVehicle(vehicleId, driver.id, data);
}

export async function deleteVehicle(userId: string, vehicleId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  const vehicle = await vehicleRepo.findVehicleByIdAndDriver(
    vehicleId,
    driver.id
  );
  if (!vehicle) throw new VehicleNotFoundError(vehicleId);

  await vehicleRepo.deleteVehicle(vehicleId, driver.id);
}
