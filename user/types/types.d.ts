import type { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
}
