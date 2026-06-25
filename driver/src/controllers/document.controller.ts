/**
 * Document Controller
 *
 * Thin layer for document upload and listing endpoints.
 */

import type { Response } from "express";
import type { AuthRequest } from "../types/types.d";
import * as documentService from "../services/document.service";
import { uploadDocumentSchema } from "../validators/driver.schema";

// POST /api/v1/drivers/me/documents

/**
 * Uploads a document reference for the authenticated driver.
 * The actual file must be uploaded to object storage before calling this —
 * this endpoint only registers the final URL.
 *
 * Request body:
 *   { documentType: DocumentType, documentUrl: string (valid URL) }
 *
 * Response 201:
 *   { success: true, message: "...", data: DocumentResponseDto }
 *
 * Errors:
 *   404 DRIVER_NOT_FOUND
 */
export const uploadDocumentController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const data = uploadDocumentSchema.parse(req.body);
  const document = await documentService.uploadDocument(userId, data);

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: document,
  });
};

// GET /api/v1/drivers/me/documents

/**
 * Returns all documents submitted by the authenticated driver.
 * Includes verification status and rejection reason if applicable.
 *
 * Response 200:
 *   { success: true, message: "...", data: DocumentResponseDto[] }
 */

export const getDocumentsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const documents = await documentService.getDocuments(userId);

  res.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    data: documents,
  });
};
