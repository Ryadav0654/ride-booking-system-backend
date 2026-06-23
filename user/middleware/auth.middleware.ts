import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error";
import type { AuthRequest, JwtPayload } from "../types/types.d";
import { config } from "../config/env";
import pino from "pino";

const logger = pino();

export function verifyToken(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing access token", "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Missing access token", "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, config.accessTokenSecret) as JwtPayload;

    if (typeof decoded !== "object" || !decoded.sub || !decoded.email) {
      throw new AppError(401, "Invalid token payload", "INVALID_TOKEN");
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch {
    next(new AppError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
}
