import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller";
import asyncHandler from "../utils/asyncHandler";
const router: Router = Router();

router.post("/login", asyncHandler(loginController));
router.post("/register", asyncHandler(registerController));

export default router;
