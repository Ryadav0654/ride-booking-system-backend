import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createTrip,
  getTrip,
  getMyTrips,
  cancelTrip,
} from "../controllers/rider.controller.js";

const router = Router();

// Secure all rider trip routes with JWT validation
router.use(verifyToken);

router.post("/", asyncHandler(createTrip));
router.get("/me", asyncHandler(getMyTrips));
router.get("/:tripId", asyncHandler(getTrip));
router.delete("/:tripId", asyncHandler(cancelTrip));

export default router;
