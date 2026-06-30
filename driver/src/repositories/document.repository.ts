import { prisma } from "../database/prisma.js";
import type { UploadDocumentDto } from "../types/driver.dto.js";

export async function createDocument(
  driverId: string,
  data: UploadDocumentDto
) {
  return prisma.driverDocument.create({
    data: {
      driverId,
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      verificationStatus: "PENDING",
    },
  });
}

export async function findDocumentById(id: string) {
  return prisma.driverDocument.findUnique({ where: { id } });
}

export async function findDocumentsByDriverId(driverId: string) {
  return prisma.driverDocument.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateDocumentVerificationStatus(
  id: string,
  status: "VERIFIED" | "REJECTED",
  rejectionReason?: string
) {
  return prisma.driverDocument.update({
    where: { id },
    data: {
      verificationStatus: status,
      ...(rejectionReason && { rejectionReason }),
    },
  });
}
