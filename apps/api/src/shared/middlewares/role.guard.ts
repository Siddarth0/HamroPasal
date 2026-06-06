import { NextFunction } from 'express';
import { AuthRequest } from './auth.guard';
import { ApiError } from '../utils/api-error';

export const authorize =
  (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
