import { prisma } from "../database/prisma.js";
import type { CreateDriverDto, UpdateDriverDto } from "../types/driver.dto.js";

// Creates Driver + DriverStats + DriverAvailability atomically
export async function createDriver(userId: string, data: CreateDriverDto) {
  return prisma.$transaction(async (tx) => {
    return tx.driver.create({
      data: {
        userId,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        stats: {
          create: {
            totalTrips: 0,
            completedTrips: 0,
            cancelledTrips: 0,
            averageRating: 0,
          },
        },
        availability: {
          create: { status: "OFFLINE" },
        },
      },
      include: {
        stats: true,
        availability: true,
      },
    });
  });
}

export async function findDriverById(id: string) {
  return prisma.driver.findUnique({ where: { id } });
}

export async function findDriverByUserId(userId: string) {
  return prisma.driver.findUnique({ where: { userId } });
}

export async function findDriverByLicenseNumber(licenseNumber: string) {
  return prisma.driver.findUnique({ where: { licenseNumber } });
}

export async function updateDriver(id: string, data: UpdateDriverDto) {
  return prisma.driver.update({
    where: { id },
    data: {
      ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
      ...(data.licenseExpiry && { licenseExpiry: data.licenseExpiry }),
    },
  });
}

// Keeps the denormalised isOnline flag in sync with DriverAvailability
export async function setDriverOnlineFlag(id: string, isOnline: boolean) {
  return prisma.driver.update({
    where: { id },
    data: { isOnline },
  });
}
