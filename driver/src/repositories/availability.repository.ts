import { prisma } from "../database/prisma.js";

export async function findAvailabilityByDriverId(driverId: string) {
  return prisma.driverAvailability.findUnique({ where: { driverId } });
}

export async function updateAvailability(
  driverId: string,
  status: "OFFLINE" | "ONLINE" | "BUSY"
) {
  return prisma.driverAvailability.update({
    where: { driverId },
    data: {
      status,
      lastSeenAt: new Date(),
    },
  });
}

export async function findStatsByDriverId(driverId: string) {
  return prisma.driverStats.findUnique({ where: { driverId } });
}

// Called by Trip Service (via event) to update counters after each trip
export async function incrementTripStats(
  driverId: string,
  outcome: "completed" | "cancelled",
  newAverageRating?: number
) {
  return prisma.driverStats.update({
    where: { driverId },
    data: {
      totalTrips: { increment: 1 },
      ...(outcome === "completed"
        ? { completedTrips: { increment: 1 } }
        : { cancelledTrips: { increment: 1 } }),
      ...(newAverageRating !== undefined && {
        averageRating: newAverageRating,
      }),
    },
  });
}
