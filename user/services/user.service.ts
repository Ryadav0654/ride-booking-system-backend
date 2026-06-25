import { prisma } from "../databse/client";
import { AppError } from "../errors/app-error";
import type {
  UpdateUserDto,
  UpdateProfileDto,
  RegisterDeviceDto,
  UserAccountDto,
  UserProfileDto,
  UserDeviceDto,
} from "../types/user.dto";

/**
 * Retrieve a user's account information by their ID.
 *
 * @throws {AppError} 404 if the user does not exist.
 */
export async function getUserById(userId: string): Promise<UserAccountDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
}

/**
 * Update account-level fields on the User record.
 * Checks for email/phone uniqueness conflicts before persisting.
 *
 * @throws {AppError} 404 if user not found.
 * @throws {AppError} 409 if new email/phone is already taken by another user.
 */
export async function updateUser(
  userId: string,
  data: UpdateUserDto
): Promise<UserAccountDto> {
  // Ensure user exists
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  // Check email uniqueness if being updated
  if (data.email) {
    const emailConflict = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
      select: { id: true },
    });
    if (emailConflict) {
      throw new AppError(
        409,
        "Email is already in use",
        "EMAIL_ALREADY_EXISTS"
      );
    }
  }

  // Check phone uniqueness if being updated
  if (data.phone) {
    const phoneConflict = await prisma.user.findFirst({
      where: { phone: data.phone, NOT: { id: userId } },
      select: { id: true },
    });
    if (phoneConflict) {
      throw new AppError(
        409,
        "Phone number is already in use",
        "PHONE_ALREADY_EXISTS"
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

/**
 * Retrieve the Profile record for a given user.
 * If the user has not yet created a profile, returns null fields
 * via an upsert-style initialisation rather than 404, since a profile
 * is always conceptually present (just empty).
 *
 * @throws {AppError} 404 if the parent user does not exist.
 */
export async function getProfile(userId: string): Promise<UserProfileDto> {
  // Verify user exists before trying to fetch the profile
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  /**
   * Use upsert so first-time profile access auto-initialises an empty record
   * instead of returning null — keeps the client-side contract simple.
   */
  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: {
      id: true,
      userId: true,
      profileImageUrl: true,
      dob: true,
      gender: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return profile;
}

/**
 * Create or update the Profile for a given user.
 *
 * @throws {AppError} 404 if the parent user does not exist.
 */
export async function upsertProfile(
  userId: string,
  data: UpdateProfileDto
): Promise<UserProfileDto> {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      ...(data.dob && { dob: data.dob }),
      ...(data.gender && { gender: data.gender }),
      ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
      ...(data.preferredLanguage && {
        preferredLanguage: data.preferredLanguage,
      }),
    },
    update: {
      ...(data.dob && { dob: data.dob }),
      ...(data.gender && { gender: data.gender }),
      ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
      ...(data.preferredLanguage && {
        preferredLanguage: data.preferredLanguage,
      }),
    },
    select: {
      id: true,
      userId: true,
      profileImageUrl: true,
      dob: true,
      gender: true,
      preferredLanguage: true,
      updatedAt: true,
    },
  });

  return profile;
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

/**
 * Return all devices registered to a user.
 *
 * @throws {AppError} 404 if the user does not exist.
 */
export async function getDevices(userId: string): Promise<UserDeviceDto[]> {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  const devices = await prisma.userDevice.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      userId: true,
      deviceId: true,
      deviceType: true,
      isActive: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  return devices;
}

/**
 * Register a new device or refresh an existing device's token for a user.
 *
 * The schema enforces one device per deviceId globally (unique constraint).
 * If the device already belongs to this user, its token and lastSeenAt are
 * updated. If it belongs to another user, we reject with a conflict error to
 * prevent device hijacking.
 *
 * @throws {AppError} 404 if the user does not exist.
 * @throws {AppError} 409 if the deviceId is registered to a different user.
 */
export async function registerDevice(
  userId: string,
  data: RegisterDeviceDto
): Promise<UserDeviceDto> {
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  // Guard against device-ID hijacking across users
  const existingDevice = await prisma.userDevice.findUnique({
    where: { deviceId: data.deviceId },
    select: { userId: true },
  });

  if (existingDevice && existingDevice.userId !== userId) {
    throw new AppError(
      409,
      "Device is already registered to another account",
      "DEVICE_CONFLICT"
    );
  }

  const device = await prisma.userDevice.upsert({
    where: { deviceId: data.deviceId },
    create: {
      userId,
      deviceId: data.deviceId,
      deviceToken: data.deviceToken,
      deviceType: data.deviceType,
    },
    update: {
      deviceToken: data.deviceToken,
      lastSeenAt: new Date(),
    },
    select: {
      id: true,
      userId: true,
      deviceId: true,
      deviceType: true,
      isActive: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  return device;
}

/**
 * Remove a device from a user's account.
 *
 * Validates that the device exists AND belongs to the requesting user before
 * deletion to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.
 *
 * @throws {AppError} 404 if the device does not exist or does not belong to the user.
 */
export async function removeDevice(
  userId: string,
  deviceId: string
): Promise<void> {
  const device = await prisma.userDevice.findUnique({
    where: { deviceId },
    select: { userId: true },
  });

  // Deliberately return 404 (not 403) to avoid leaking device existence
  if (!device || device.userId !== userId) {
    throw new AppError(404, "Device not found", "DEVICE_NOT_FOUND");
  }

  await prisma.userDevice.delete({
    where: { deviceId },
  });
}
