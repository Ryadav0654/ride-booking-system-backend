import type { Request } from "express";

export interface AuthUser {
  id: string; // userId from User Service (JWT sub claim)
  email: string;
  role?: string; // Opt role for Admin / Driver / Rider context if needed
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}
