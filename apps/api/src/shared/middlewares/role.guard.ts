import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
