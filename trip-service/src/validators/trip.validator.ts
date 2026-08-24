import { z } from "zod";

const PaymentMethodEnum = z.enum(["CASH", "CARD", "WALLET"]);
const RideTypeEnum = z.enum([
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "AUTO_RICKSHAW",
  "BIKE",
  "LUXURY",
  "MINIVAN",
]);

export const createTripSchema = z.object({
  body: z.object({
    pickupLatitude: z
      .number()
      .min(-90)
      .max(90, "Latitude must be between -90 and 90"),
    pickupLongitude: z
      .number()
      .min(-180)
      .max(180, "Longitude must be between -180 and 180"),
    dropLatitude: z
      .number()
      .min(-90)
      .max(90, "Latitude must be between -90 and 90"),
    dropLongitude: z
      .number()
      .min(-180)
      .max(180, "Longitude must be between -180 and 180"),
    distance: z.number().positive("Distance must be greater than 0"),
    duration: z
      .number()
      .int()
      .positive("Duration in seconds must be greater than 0"),
    paymentMethod: PaymentMethodEnum,
    rideType: RideTypeEnum,
  }),
});

export const getTripSchema = z.object({
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID format"),
  }),
});

export const cancelTripSchema = z.object({
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID format"),
  }),
  body: z.object({
    reason: z
      .string()
      .min(3, "Cancellation reason must be at least 3 characters long"),
  }),
});

export const completeTripSchema = z.object({
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID format"),
  }),
  body: z
    .object({
      finalFare: z
        .number()
        .positive("Final fare must be greater than 0")
        .optional(),
    })
    .optional(),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().optional().default(10),
    page: z.coerce.number().int().positive().optional().default(1),
  }),
});

export const driverTripActionSchema = z.object({
  params: z.object({
    tripId: z.string().uuid("Invalid trip ID format"),
  }),
});

export type CreateTripDto = z.infer<typeof createTripSchema>["body"];
export type CancelTripDto = z.infer<typeof cancelTripSchema>["body"];
export type CompleteTripDto = z.infer<typeof completeTripSchema>["body"];
