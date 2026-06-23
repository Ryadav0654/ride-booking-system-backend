import type { z } from "zod";
import type {
  updateUserSchema,
  updateProfileSchema,
  registerDeviceSchema,
} from "../validators/user.schema";

/** Partial update payload for the User account */
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

/** Partial update payload for the User Profile */
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

/** Payload to register/upsert a user device */
export type RegisterDeviceDto = z.infer<typeof registerDeviceSchema>;

/** Lean user account representation — never exposes password/internal fields */
export interface UserAccountDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/** User profile representation */
export interface UserProfileDto {
  id: string;
  userId: string;
  profileImageUrl: string | null;
  dob: Date | null;
  gender: string | null;
  preferredLanguage: string | null;
  updatedAt: Date;
}

/** Device representation */
export interface UserDeviceDto {
  id: string;
  userId: string;
  deviceId: string;
  deviceType: string;
  isActive: boolean;
  lastSeenAt: Date;
  createdAt: Date;
}
