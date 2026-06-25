import { prisma } from "../database/prisma.js";
import type {
  CreateVehicleDto,
  UpdateVehicleDto,
} from "../types/driver.dto.js";

export async function createVehicle(driverId: string, data: CreateVehicleDto) {
  return prisma.driverVehicle.create({
    data: {
      driverId,
      registrationNumber: data.registrationNumber,
      make: data.make,
      model: data.model,
      color: data.color,
      year: data.year,
      vehicleType: data.vehicleType,
      status: "PENDING_VERIFICATION",
    },
  });
}

export async function findVehicleById(id: string) {
  return prisma.driverVehicle.findUnique({ where: { id } });
}

// Returns null if vehicle doesn't exist OR belongs to a different driver — intentional for security
export async function findVehicleByIdAndDriver(id: string, driverId: string) {
  return prisma.driverVehicle.findFirst({ where: { id, driverId } });
}

export async function findVehiclesByDriverId(driverId: string) {
  return prisma.driverVehicle.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findVehicleByRegistrationNumber(
  registrationNumber: string
) {
  return prisma.driverVehicle.findUnique({ where: { registrationNumber } });
}

export async function updateVehicle(
  id: string,
  driverId: string,
  data: UpdateVehicleDto
) {
  return prisma.driverVehicle.update({
    where: { id },
    data: {
      ...(data.make && { make: data.make }),
      ...(data.model && { model: data.model }),
      ...(data.color && { color: data.color }),
      ...(data.year && { year: data.year }),
      ...(data.vehicleType && { vehicleType: data.vehicleType }),
      ...(data.status && { status: data.status }),
    },
  });
}

export async function deleteVehicle(id: string, driverId: string) {
  return prisma.driverVehicle.delete({ where: { id } });
}
