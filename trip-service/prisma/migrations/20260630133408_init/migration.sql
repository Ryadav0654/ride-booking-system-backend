-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('REQUESTED', 'SEARCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'WALLET');

-- CreateEnum
CREATE TYPE "RideType" AS ENUM ('SEDAN', 'SUV', 'HATCHBACK', 'AUTO_RICKSHAW', 'BIKE', 'LUXURY', 'MINIVAN');

-- CreateEnum
CREATE TYPE "ActorRole" AS ENUM ('RIDER', 'DRIVER', 'SYSTEM', 'ADMIN');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "driverId" TEXT,
    "pickupLatitude" DECIMAL(10,7) NOT NULL,
    "pickupLongitude" DECIMAL(10,7) NOT NULL,
    "dropLatitude" DECIMAL(10,7) NOT NULL,
    "dropLongitude" DECIMAL(10,7) NOT NULL,
    "estimatedFare" DECIMAL(10,2) NOT NULL,
    "finalFare" DECIMAL(10,2),
    "distance" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "rideType" "RideType" NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStatusHistory" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "previousStatus" "TripStatus",
    "currentStatus" "TripStatus" NOT NULL,
    "changedBy" "ActorRole" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCancellation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "cancelledBy" "ActorRole" NOT NULL,
    "reason" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_riderId_idx" ON "Trip"("riderId");

-- CreateIndex
CREATE INDEX "Trip_driverId_idx" ON "Trip"("driverId");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "TripStatusHistory_tripId_idx" ON "TripStatusHistory"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripCancellation_tripId_key" ON "TripCancellation"("tripId");

-- AddForeignKey
ALTER TABLE "TripStatusHistory" ADD CONSTRAINT "TripStatusHistory_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCancellation" ADD CONSTRAINT "TripCancellation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
