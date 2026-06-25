import type { z } from "zod";
import type {
  createDriverSchema,
  updateDriverSchema,
  createVehicleSchema,
  updateVehicleSchema,
  uploadDocumentSchema,
  updateAvailabilitySchema,
  vehicleIdParamSchema,
} from "../validators/driver.schema";

export type CreateDriverDto = z.infer<typeof createDriverSchema>;
export type UpdateDriverDto = z.infer<typeof updateDriverSchema>;
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;
export type UploadDocumentDto = z.infer<typeof uploadDocumentSchema>;
export type UpdateAvailabilityDto = z.infer<typeof updateAvailabilitySchema>;
export type VehicleIdParam = z.infer<typeof vehicleIdParamSchema>;

export interface DriverResponseDto {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  onboardingStatus: string;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleResponseDto {
  id: string;
  driverId: string;
  registrationNumber: string;
  make: string;
  model: string;
  color: string;
  year: number;
  vehicleType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentResponseDto {
  id: string;
  driverId: string;
  documentType: string;
  documentUrl: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityResponseDto {
  id: string;
  driverId: string;
  status: string;
  lastSeenAt: Date;
  updatedAt: Date;
}

export interface StatsResponseDto {
  id: string;
  driverId: string;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageRating: string; // Decimal serialises to string in JSON
  updatedAt: Date;
}
