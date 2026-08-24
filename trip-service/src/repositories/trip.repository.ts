import { prisma } from "../database/prisma.js";
import {
  Prisma,
  TripStatus,
  PaymentMethod,
  RideType,
  ActorRole,
} from "../../generated/prisma/client.js";

export interface CreateTripParams {
  riderId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  rideType: RideType;
}

/**
 * createTrip
 * Atomically creates a trip and its initial REQUESTED status history.
 */
export async function createTrip(params: CreateTripParams) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({
      data: {
        riderId: params.riderId,
        pickupLatitude: new Prisma.Decimal(params.pickupLatitude),
        pickupLongitude: new Prisma.Decimal(params.pickupLongitude),
        dropLatitude: new Prisma.Decimal(params.dropLatitude),
        dropLongitude: new Prisma.Decimal(params.dropLongitude),
        estimatedFare: new Prisma.Decimal(params.estimatedFare),
        distance: new Prisma.Decimal(params.distance),
        duration: params.duration,
        paymentMethod: params.paymentMethod,
        rideType: params.rideType,
        status: TripStatus.REQUESTED,
      },
    });

    await tx.tripStatusHistory.create({
      data: {
        tripId: trip.id,
        currentStatus: TripStatus.REQUESTED,
        changedBy: ActorRole.RIDER,
      },
    });

    return trip;
  });
}

/**
 * findTripById
 * Fetches a trip by ID, including its status history and cancellation details if any.
 */
export async function findTripById(id: string) {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { timestamp: "desc" },
      },
      cancellation: true,
    },
  });
}

/**
 * findTripsByRider
 * Fetches trips requested by a specific rider with pagination.
 */
export async function findTripsByRider(
  riderId: string,
  limit = 10,
  offset = 0
) {
  return prisma.trip.findMany({
    where: { riderId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      cancellation: true,
    },
  });
}

/**
 * findTripsByDriver
 * Fetches trips completed/assigned to a specific driver with pagination.
 */
export async function findTripsByDriver(
  driverId: string,
  limit = 10,
  offset = 0
) {
  return prisma.trip.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      cancellation: true,
    },
  });
}

/**
 * assignDriver
 * Atomically updates driver ID and sets state to DRIVER_ASSIGNED, with status history logging.
 */
export async function assignDriver(
  tripId: string,
  driverId: string,
  status: TripStatus,
  previousStatus: TripStatus,
  changedBy: ActorRole
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.update({
      where: { id: tripId },
      data: {
        driverId,
        status,
      },
    });

    await tx.tripStatusHistory.create({
      data: {
        tripId,
        previousStatus,
        currentStatus: status,
        changedBy,
      },
    });

    return trip;
  });
}

/**
 * updateStatus
 * Atomically updates status and appends a status history record, with optional final fare update.
 */
export async function updateStatus(
  tripId: string,
  status: TripStatus,
  previousStatus: TripStatus,
  changedBy: ActorRole,
  finalFare?: number
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status,
        ...(finalFare !== undefined && {
          finalFare: new Prisma.Decimal(finalFare),
        }),
      },
    });

    await tx.tripStatusHistory.create({
      data: {
        tripId,
        previousStatus,
        currentStatus: status,
        changedBy,
      },
    });

    return trip;
  });
}

/**
 * createStatusHistory
 * Creates a standalone status history entry.
 */
export async function createStatusHistory(
  tripId: string,
  currentStatus: TripStatus,
  previousStatus?: TripStatus,
  changedBy: ActorRole = ActorRole.SYSTEM
) {
  return prisma.tripStatusHistory.create({
    data: {
      tripId,
      currentStatus,
      previousStatus,
      changedBy,
    },
  });
}

/**
 * createCancellation
 * Atomically updates trip status to CANCELLED, logs cancellation details, and logs status history.
 */
export async function createCancellation(
  tripId: string,
  cancelledBy: ActorRole,
  reason: string,
  status: TripStatus,
  previousStatus: TripStatus
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.update({
      where: { id: tripId },
      data: { status },
    });

    const cancellation = await tx.tripCancellation.create({
      data: {
        tripId,
        cancelledBy,
        reason,
      },
    });

    await tx.tripStatusHistory.create({
      data: {
        tripId,
        previousStatus,
        currentStatus: status,
        changedBy: cancelledBy,
      },
    });

    return { trip, cancellation };
  });
}

/**
 * rejectTripAssignment
 * Atomically clears the driverId and sets the status back to SEARCHING.
 */
export async function rejectTripAssignment(
  tripId: string,
  previousStatus: TripStatus,
  changedBy: ActorRole
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.update({
      where: { id: tripId },
      data: {
        driverId: null,
        status: TripStatus.SEARCHING,
      },
    });

    await tx.tripStatusHistory.create({
      data: {
        tripId,
        previousStatus,
        currentStatus: TripStatus.SEARCHING,
        changedBy,
      },
    });

    return trip;
  });
}

/**
 * findAllTrips
 * Admin method to list all trips in system with pagination.
 */
export async function findAllTrips(limit = 10, offset = 0) {
  return prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      cancellation: true,
    },
  });
}

/**
 * countAllTrips
 * Admin method to count total trips in the system.
 */
export async function countAllTrips() {
  return prisma.trip.count();
}
