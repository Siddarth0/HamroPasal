import type { Role } from '@/generated/prisma';

// Augments Express' Request with the principal set by the `authenticate`
// middleware (see shared/middlewares/auth.guard.ts). Kept here for now; may be
// re-homed into packages/shared-types during Phase 1.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
        storeId?: string;
      };
    }
  }
}

export {};
