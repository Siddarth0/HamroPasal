import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";

/**
 * Gate for actions that require a verified email (e.g. checkout / placing orders).
 * Must run after `authenticate`, which populates `req.user`.
 */
export const requireVerifiedEmail = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isEmailVerified) {
    throw new ApiError("Please verify your email to continue", 403);
  }
  next();
};
