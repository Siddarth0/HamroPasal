import type { AuthPrincipal } from 'shared-types';

// Augments Express' Request with the principal set by the `authenticate`
// middleware (see shared/middlewares/auth.guard.ts). The shape is the canonical
// AuthPrincipal contract from the shared-types package.
declare global {
  namespace Express {
    interface Request {
      user?: AuthPrincipal;
    }
  }
}

export {};
