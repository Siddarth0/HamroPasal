import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import type { Audience } from '../utils/jwt';
import type { Role } from '@/generated/prisma';

// Each privileged role is operated from its own app. A token minted for one app
// (its Origin-derived scope) may not perform another app's privileged actions —
// so e.g. a storefront-scoped token can never hit admin/seller endpoints, even
// for a user who happens to hold that role.
const ROLE_SCOPE: Record<Role, Audience> = {
  CUSTOMER: 'web',
  SELLER: 'seller',
  ADMIN: 'admin',
};

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new ApiError('Forbidden: insufficient permissions', 403));
    }

    // The access token's scope must match one of the allowed roles' apps.
    const allowedScopes = roles.map((r) => ROLE_SCOPE[r as Role]);
    if (!req.user.scope || !allowedScopes.includes(req.user.scope)) {
      return next(new ApiError('Forbidden: wrong app for this action', 403));
    }

    next();
  };
