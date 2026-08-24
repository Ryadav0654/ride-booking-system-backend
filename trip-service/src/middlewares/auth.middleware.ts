import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, JwtPayload } from "../types/types";
import { config } from "../config/env";
import { InvalidTokenError, UnauthorizedError } from "../errors/trip-errors";

export function verifyToken(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Missing access token");
    }

    const decoded = jwt.verify(token, config.accessTokenSecret) as JwtPayload;

    if (typeof decoded !== "object" || !decoded.sub || !decoded.email) {
      throw new InvalidTokenError();
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof InvalidTokenError) {
      next(err);
    } else {
      next(new InvalidTokenError());
    }
  }
}
