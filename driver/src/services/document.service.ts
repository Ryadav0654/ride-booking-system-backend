import * as documentRepo from "../repositories/document.repository.js";
import * as driverRepo from "../repositories/driver.repository.js";
import { DriverNotFoundError } from "../errors/driver-errors.js";
import type { UploadDocumentDto } from "../types/driver.dto.js";

export async function uploadDocument(userId: string, data: UploadDocumentDto) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  return documentRepo.createDocument(driver.id, data);
}

export async function getDocuments(userId: string) {
  const driver = await driverRepo.findDriverByUserId(userId);
  if (!driver) throw new DriverNotFoundError();

  return documentRepo.findDocumentsByDriverId(driver.id);
}
