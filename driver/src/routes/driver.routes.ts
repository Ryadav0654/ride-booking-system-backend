import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  registerDriverController,
  getDriverController,
  updateDriverController,
} from "../controllers/driver.controller.js";

import {
  addVehicleController,
  getVehiclesController,
  updateVehicleController,
  deleteVehicleController,
} from "../controllers/vehicle.controller.js";

import {
  uploadDocumentController,
  getDocumentsController,
} from "../controllers/document.controller.js";

import { updateStatusController } from "../controllers/availability.controller.js";
import { getStatsController } from "../controllers/stats.controller.js";

const router = Router();

router.use(verifyToken);

// driver routes
router.post("/", asyncHandler(registerDriverController));
router.get("/me", asyncHandler(getDriverController));
router.patch("/me", asyncHandler(updateDriverController));

// vehicle routes
router.post("/me/vehicles", asyncHandler(addVehicleController));
router.get("/me/vehicles", asyncHandler(getVehiclesController));
router.patch("/me/vehicles/:vehicleId", asyncHandler(updateVehicleController));
router.delete("/me/vehicles/:vehicleId", asyncHandler(deleteVehicleController));

// document routes
router.post("/me/documents", asyncHandler(uploadDocumentController));
router.get("/me/documents", asyncHandler(getDocumentsController));

// availability routes
router.patch("/me/status", asyncHandler(updateStatusController));

// stats routes
router.get("/me/stats", asyncHandler(getStatsController));

export default router;
