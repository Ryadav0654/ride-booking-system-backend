import { kafkaProducerService } from "./kafka-producer.js";

export enum TripEventTopic {
  TRIP_REQUESTED = "trip.requested",
  TRIP_ACCEPTED = "trip.accepted",
  TRIP_STARTED = "trip.started",
  TRIP_COMPLETED = "trip.completed",
  TRIP_CANCELLED = "trip.cancelled",
}

export interface BaseTripEvent<TPayload> {
  eventId: string;
  tripId: string;
  timestamp: string;
  payload: TPayload;
}

export async function publishTripRequested(trip: any): Promise<void> {
  const event: BaseTripEvent<any> = {
    eventId: crypto.randomUUID(),
    tripId: trip.id,
    timestamp: new Date().toISOString(),
    payload: {
      riderId: trip.riderId,
      pickupLatitude: trip.pickupLatitude.toString(),
      pickupLongitude: trip.pickupLongitude.toString(),
      dropLatitude: trip.dropLatitude.toString(),
      dropLongitude: trip.dropLongitude.toString(),
      estimatedFare: trip.estimatedFare.toString(),
      distance: trip.distance.toString(),
      duration: trip.duration,
      rideType: trip.rideType,
      status: trip.status,
      createdAt: trip.createdAt,
    },
  };
  await kafkaProducerService.publish(TripEventTopic.TRIP_REQUESTED, event);
}

export async function publishTripAccepted(trip: any): Promise<void> {
  const event: BaseTripEvent<any> = {
    eventId: crypto.randomUUID(),
    tripId: trip.id,
    timestamp: new Date().toISOString(),
    payload: {
      riderId: trip.riderId,
      driverId: trip.driverId,
      status: trip.status,
      updatedAt: trip.updatedAt,
    },
  };
  await kafkaProducerService.publish(TripEventTopic.TRIP_ACCEPTED, event);
}

export async function publishTripStarted(trip: any): Promise<void> {
  const event: BaseTripEvent<any> = {
    eventId: crypto.randomUUID(),
    tripId: trip.id,
    timestamp: new Date().toISOString(),
    payload: {
      riderId: trip.riderId,
      driverId: trip.driverId,
      status: trip.status,
      updatedAt: trip.updatedAt,
    },
  };
  await kafkaProducerService.publish(TripEventTopic.TRIP_STARTED, event);
}

export async function publishTripCompleted(trip: any): Promise<void> {
  const event: BaseTripEvent<any> = {
    eventId: crypto.randomUUID(),
    tripId: trip.id,
    timestamp: new Date().toISOString(),
    payload: {
      riderId: trip.riderId,
      driverId: trip.driverId,
      status: trip.status,
      finalFare: trip.finalFare?.toString(),
      updatedAt: trip.updatedAt,
    },
  };
  await kafkaProducerService.publish(TripEventTopic.TRIP_COMPLETED, event);
}

export async function publishTripCancelled(
  trip: any,
  cancellation: any
): Promise<void> {
  const event: BaseTripEvent<any> = {
    eventId: crypto.randomUUID(),
    tripId: trip.id,
    timestamp: new Date().toISOString(),
    payload: {
      riderId: trip.riderId,
      driverId: trip.driverId,
      status: trip.status,
      cancelledBy: cancellation.cancelledBy,
      reason: cancellation.reason,
      cancelledAt: cancellation.cancelledAt,
    },
  };
  await kafkaProducerService.publish(TripEventTopic.TRIP_CANCELLED, event);
}
