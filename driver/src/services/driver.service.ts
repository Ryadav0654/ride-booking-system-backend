import * as driverRepo from "../repositories/driver.repository.js";
import {
  DriverAlreadyExistsError,
  DriverNotFoundError,
} from "../errors/driver-errors.js";
import type { CreateDriverDto, UpdateDriverDto } from "../types/driver.dto.js";

export async function registerDriver(userId: string, data: CreateDriverDto) {
  const existing = await driverRepo.findDriverByUserId(userId);
  if (existing) throw new DriverAlreadyExistsError();

  return driverRepo.createDriver(userId, data);
}

export async function getDriverByUserId(userId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();
  return driver;
}

export async function getDriverById(id: string) {
  const driver = await driverRepo.findDriverById(id);
  if (!driver) throw new DriverNotFoundError(id);
  return driver;
}

export async function updateDriver(userId: string, data: UpdateDriverDto) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  // Check new licenseNumber doesn't conflict with another driver
  if (data.licenseNumber && data.licenseNumber !== driver.licenseNumber) {
    const conflict = await driverRepo.findDriverByLicenseNumber(
      data.licenseNumber
    );
    if (conflict) throw new DriverAlreadyExistsError();
  }

  return driverRepo.updateDriver(driver.id, data);
}
