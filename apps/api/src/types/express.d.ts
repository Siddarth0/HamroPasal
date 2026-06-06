import type { AuthPrincipal } from 'shared-types';

// `req.user` (declared as `Express.User | undefined` by @types/passport and set
// by the `authenticate` middleware) takes the canonical AuthPrincipal shape from
// the shared-types package. Augmenting Express.User keeps it compatible with
// Passport's verify callback.
declare global {
  namespace Express {
    interface User extends AuthPrincipal {}
  }
}

export {};
