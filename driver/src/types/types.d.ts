/**
 * Request / Auth Types
 *
 * Extends Express's Request with the authenticated user payload.
 * This is populated by `verifyToken` middleware and consumed by controllers.
 *
 * Design decision: We extend Request rather than using `res.locals` so that
 * TypeScript enforces `req.user` access only after the middleware has run.
 */

import type { Request } from "express";

export interface AuthUser {
  id: string; // userId from User Service (JWT sub claim)
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  iat?: number;
  exp?: number;
}
