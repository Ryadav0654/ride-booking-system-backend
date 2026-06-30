import * as availabilityRepo from "../repositories/availability.repository.js";
import * as driverRepo from "../repositories/driver.repository.js";
import { DriverNotFoundError } from "../errors/driver-errors.js";

export async function getStats(userId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  const stats = await availabilityRepo.findStatsByDriverId(driver.id);
  if (!stats) throw new DriverNotFoundError();

  return stats;
}
