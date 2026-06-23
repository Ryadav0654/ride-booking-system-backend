import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import {
  getUserController,
  updateUserController,
  getProfileController,
  updateProfileController,
  getDevicesController,
  registerDeviceController,
  removeDeviceController,
} from "../controllers/user.controller";

const router: Router = Router();

router.use(verifyToken);

router
  .route("/")
  .get(asyncHandler(getUserController))
  .patch(asyncHandler(updateUserController));

router
  .route("/profile")
  .get(asyncHandler(getProfileController))
  .patch(asyncHandler(updateProfileController));

router
  .route("/devices")
  .get(asyncHandler(getDevicesController))
  .post(asyncHandler(registerDeviceController));

router.route("/devices/:deviceId").delete(asyncHandler(removeDeviceController));

export default router;
