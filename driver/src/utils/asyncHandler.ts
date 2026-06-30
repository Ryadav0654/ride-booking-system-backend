/**
 * asyncHandler
 *
 * Wraps an async Express request handler so that any thrown error or
 * rejected promise is forwarded to `next()` automatically.
 *
 * Without this wrapper, unhandled promise rejections in async handlers
 * would crash the process (in older Node/Bun) or silently hang the request.
 *
 * Usage in routers:
 *   router.get('/me', verifyToken, asyncHandler(getDriverController));
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = (fn: Function): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
