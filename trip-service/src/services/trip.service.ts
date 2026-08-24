import * as tripRepository from "../repositories/trip.repository.js";
import {
  TripStatus,
  ActorRole,
  RideType,
  PaymentMethod,
} from "../../generated/prisma/client.js";
import {
  TripNotFoundError,
  InvalidTripStatusError,
  TripAlreadyCancelledError,
  TripAlreadyCompletedError,
  DriverAlreadyAssignedError,
  InvalidDriverError,
  ForbiddenError,
} from "../errors/trip-errors.js";
import {
  publishTripRequested,
  publishTripAccepted,
  publishTripStarted,
  publishTripCompleted,
  publishTripCancelled,
} from "../events/event-publisher.js";

/**
 * estimateFare
 * Simple fare estimation logic based on distance and ride type.
 * formula: Base Fare + (Distance * Rate Per Km)
 */
export function estimateFare(distance: number, rideType: RideType): number {
  const baseFares: Record<RideType, number> = {
    [RideType.BIKE]: 15.0,
    [RideType.AUTO_RICKSHAW]: 30.0,
    [RideType.HATCHBACK]: 50.0,
    [RideType.SEDAN]: 70.0,
    [RideType.SUV]: 100.0,
    [RideType.LUXURY]: 150.0,
    [RideType.MINIVAN]: 120.0,
  };

  const ratePerKm: Record<RideType, number> = {
    [RideType.BIKE]: 5.0,
    [RideType.AUTO_RICKSHAW]: 10.0,
    [RideType.HATCHBACK]: 12.0,
    [RideType.SEDAN]: 15.0,
    [RideType.SUV]: 20.0,
    [RideType.LUXURY]: 35.0,
    [RideType.MINIVAN]: 25.0,
  };

  const base = baseFares[rideType] ?? 50.0;
  const rate = ratePerKm[rideType] ?? 12.0;

  return parseFloat((base + distance * rate).toFixed(2));
}

/**
 * createTripService
 * Business logic for Rider requesting a trip.
 */
export async function createTripService(
  params: Omit<tripRepository.CreateTripParams, "estimatedFare">
) {
  // Validate rider (in a decoupled microservice structure, verify user exists in local cache or trust JWT token)
  if (!params.riderId) {
    throw new InvalidTripStatusError("Rider ID is required");
  }

  // Calculate estimated fare
  const fare = estimateFare(params.distance, params.rideType);
  const updatedParams: tripRepository.CreateTripParams = {
    ...params,
    estimatedFare: fare,
  };

  // 1. Create the trip (initial status is REQUESTED)
  const trip = await tripRepository.createTrip(updatedParams);

  // 2. Automically transition to SEARCHING to begin driver dispatch matching loop
  const searchingTrip = await tripRepository.updateStatus(
    trip.id,
    TripStatus.SEARCHING,
    TripStatus.REQUESTED,
    ActorRole.SYSTEM
  );

  // 3. Publish event to Kafka
  await publishTripRequested(searchingTrip);

  return searchingTrip;
}

/**
 * getTripService
 * Fetches a single trip with permission enforcement.
 */
export async function getTripService(
  tripId: string,
  userId: string,
  role?: string
) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  // Authorization check: Only Admin, Rider of the trip, or Assigned Driver can view the details
  if (role !== "ADMIN" && trip.riderId !== userId && trip.driverId !== userId) {
    throw new ForbiddenError("You do not have access to view this trip");
  }

  return trip;
}

/**
 * getRiderTripsService
 * List trips booked by the authenticated rider.
 */
export async function getRiderTripsService(
  riderId: string,
  limit = 10,
  offset = 0
) {
  return tripRepository.findTripsByRider(riderId, limit, offset);
}

/**
 * getDriverTripsService
 * List trips assigned/completed by the authenticated driver.
 */
export async function getDriverTripsService(
  driverId: string,
  limit = 10,
  offset = 0
) {
  return tripRepository.findTripsByDriver(driverId, limit, offset);
}

/**
 * getAdminTripsService
 * List all trips in the system for admin dashboard.
 */
export async function getAdminTripsService(limit = 10, offset = 0) {
  const trips = await tripRepository.findAllTrips(limit, offset);
  const total = await tripRepository.countAllTrips();
  return { trips, total, limit, offset };
}

/**
 * acceptTripService
 * Driver accepts the ride matching request.
 */
export async function acceptTripService(tripId: string, driverId: string) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  if (trip.status !== TripStatus.SEARCHING) {
    if (trip.status === TripStatus.DRIVER_ASSIGNED) {
      throw new DriverAlreadyAssignedError();
    }
    throw new InvalidTripStatusError(
      `Trip cannot be accepted in status: ${trip.status}`
    );
  }

  // Atomically assign driver and change status to DRIVER_ASSIGNED
  const updatedTrip = await tripRepository.assignDriver(
    tripId,
    driverId,
    TripStatus.DRIVER_ASSIGNED,
    TripStatus.SEARCHING,
    ActorRole.DRIVER
  );

  // Publish TripAccepted event
  await publishTripAccepted(updatedTrip);

  return updatedTrip;
}

/**
 * rejectTripService
 * Driver rejects a trip matching request or cancels assignment.
 */
export async function rejectTripService(tripId: string, driverId: string) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  // Case 1: Driver rejects matching ping while trip is in SEARCHING
  if (trip.status === TripStatus.SEARCHING) {
    // No-op for DB, just return success (matching engine will query other drivers)
    return trip;
  }

  // Case 2: Driver rejects an assigned trip (DRIVER_ASSIGNED) -> rollback to SEARCHING
  if (trip.status === TripStatus.DRIVER_ASSIGNED) {
    if (trip.driverId !== driverId) {
      throw new InvalidDriverError(
        "You are not the driver assigned to this trip"
      );
    }

    const updatedTrip = await tripRepository.rejectTripAssignment(
      tripId,
      TripStatus.DRIVER_ASSIGNED,
      ActorRole.DRIVER
    );

    return updatedTrip;
  }

  throw new InvalidTripStatusError(
    `Trip cannot be rejected in status: ${trip.status}`
  );
}

/**
 * arrivedAtPickupService
 * Driver arrives at rider pickup location.
 */
export async function arrivedAtPickupService(tripId: string, driverId: string) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  if (trip.driverId !== driverId) {
    throw new InvalidDriverError(
      "You are not the driver assigned to this trip"
    );
  }

  if (trip.status !== TripStatus.DRIVER_ASSIGNED) {
    throw new InvalidTripStatusError(
      `Cannot mark driver as arrived. Trip status must be DRIVER_ASSIGNED, currently: ${trip.status}`
    );
  }

  const updatedTrip = await tripRepository.updateStatus(
    tripId,
    TripStatus.DRIVER_ARRIVED,
    TripStatus.DRIVER_ASSIGNED,
    ActorRole.DRIVER
  );

  return updatedTrip;
}

/**
 * startTripService
 * Driver starts the journey with rider.
 */
export async function startTripService(tripId: string, driverId: string) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  if (trip.driverId !== driverId) {
    throw new InvalidDriverError(
      "You are not the driver assigned to this trip"
    );
  }

  if (trip.status !== TripStatus.DRIVER_ARRIVED) {
    throw new InvalidTripStatusError(
      `Cannot start trip. Driver must first arrive at pickup, current status: ${trip.status}`
    );
  }

  const updatedTrip = await tripRepository.updateStatus(
    tripId,
    TripStatus.IN_PROGRESS,
    TripStatus.DRIVER_ARRIVED,
    ActorRole.DRIVER
  );

  // Publish TripStarted event
  await publishTripStarted(updatedTrip);

  return updatedTrip;
}

/**
 * completeTripService
 * Driver completes the journey at destination.
 */
export async function completeTripService(
  tripId: string,
  driverId: string,
  finalFare?: number
) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  if (trip.driverId !== driverId) {
    throw new InvalidDriverError(
      "You are not the driver assigned to this trip"
    );
  }

  if (trip.status !== TripStatus.IN_PROGRESS) {
    throw new InvalidTripStatusError(
      `Cannot complete trip. Trip must be IN_PROGRESS, current status: ${trip.status}`
    );
  }

  // Use estimated fare if final fare is not provided
  const fare = finalFare ?? parseFloat(trip.estimatedFare.toString());

  const updatedTrip = await tripRepository.updateStatus(
    tripId,
    TripStatus.COMPLETED,
    TripStatus.IN_PROGRESS,
    ActorRole.DRIVER,
    fare
  );

  // Publish TripCompleted event
  await publishTripCompleted(updatedTrip);

  return updatedTrip;
}

/**
 * cancelTripService
 * Cancellation logic with policy checks.
 */
export async function cancelTripService(
  tripId: string,
  cancelledBy: ActorRole,
  userId: string,
  reason: string,
  role?: string
) {
  const trip = await tripRepository.findTripById(tripId);
  if (!trip) {
    throw new TripNotFoundError(tripId);
  }

  // Enforce cancel privileges
  if (role !== "ADMIN") {
    if (cancelledBy === ActorRole.RIDER && trip.riderId !== userId) {
      throw new ForbiddenError("You cannot cancel someone else's trip");
    }
    if (cancelledBy === ActorRole.DRIVER && trip.driverId !== userId) {
      throw new ForbiddenError(
        "You cannot cancel a trip you are not assigned to"
      );
    }
  }

  // Cancellation Policy Check
  if (trip.status === TripStatus.CANCELLED) {
    throw new TripAlreadyCancelledError();
  }
  if (trip.status === TripStatus.COMPLETED) {
    throw new TripAlreadyCompletedError();
  }
  if (trip.status === TripStatus.IN_PROGRESS) {
    throw new InvalidTripStatusError(
      "Cannot cancel a trip that is already in progress"
    );
  }

  // Cancel and log cancellation + write status history atomically
  const { trip: updatedTrip, cancellation } =
    await tripRepository.createCancellation(
      tripId,
      cancelledBy,
      reason,
      TripStatus.CANCELLED,
      trip.status
    );

  // Publish TripCancelled event
  await publishTripCancelled(updatedTrip, cancellation);

  return { trip: updatedTrip, cancellation };
}
