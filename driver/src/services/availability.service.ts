import * as availabilityRepo from "../repositories/availability.repository.js";
import * as driverRepo from "../repositories/driver.repository.js";
import {
  DriverNotFoundError,
  DriverNotVerifiedError,
  InvalidStatusTransitionError,
} from "../errors/driver-errors.js";
import type { UpdateAvailabilityDto } from "../types/driver.dto.js";

type Status = "OFFLINE" | "ONLINE" | "BUSY";

// FSM: valid status transitions
const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  OFFLINE: ["ONLINE"],
  ONLINE: ["BUSY", "OFFLINE"],
  BUSY: ["OFFLINE"],
};

function isValidTransition(from: Status, to: Status): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateStatus(
  userId: string,
  data: UpdateAvailabilityDto
) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  // Only VERIFIED drivers are allowed to go ONLINE
  if (data.status === "ONLINE" && driver.onboardingStatus !== "VERIFIED") {
    throw new DriverNotVerifiedError();
  }

  const availability = await availabilityRepo.findAvailabilityByDriverId(
    driver.id
  );
  if (!availability) throw new DriverNotFoundError();

  const currentStatus = availability.status as Status;
  const requestedStatus = data.status as Status;

  if (!isValidTransition(currentStatus, requestedStatus)) {
    throw new InvalidStatusTransitionError(currentStatus, requestedStatus);
  }

  const updated = await availabilityRepo.updateAvailability(
    driver.id,
    requestedStatus
  );

  // Keep the denormalised isOnline flag on Driver in sync
  await driverRepo.setDriverOnlineFlag(driver.id, requestedStatus === "ONLINE");

  return updated;
}

export async function getAvailability(userId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  return availabilityRepo.findAvailabilityByDriverId(driver.id);
}
