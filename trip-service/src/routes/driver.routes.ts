import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  acceptTrip,
  rejectTrip,
  arrivedAtPickup,
  startTrip,
  completeTrip,
} from "../controllers/driver.controller.js";

const router = Router();

// Secure all driver routes with JWT validation
router.use(verifyToken);

router.patch("/:tripId/accept", asyncHandler(acceptTrip));
router.patch("/:tripId/reject", asyncHandler(rejectTrip));
router.patch("/:tripId/arrived", asyncHandler(arrivedAtPickup));
router.patch("/:tripId/start", asyncHandler(startTrip));
router.patch("/:tripId/complete", asyncHandler(completeTrip));

export default router;
