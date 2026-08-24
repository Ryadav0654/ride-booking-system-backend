import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { listAllTrips } from "../controllers/admin.controller.js";

const router = Router();

// Secure all admin routes with JWT validation
router.use(verifyToken);

router.get("/", asyncHandler(listAllTrips));

export default router;
