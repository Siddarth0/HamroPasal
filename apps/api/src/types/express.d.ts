import type { AuthPrincipal } from 'shared-types';
import type { Audience } from '@/shared/utils/jwt';

// `req.user` (declared as `Express.User | undefined` by @types/passport and set
// by the `authenticate` middleware) takes the canonical AuthPrincipal shape from
// the shared-types package. Augmenting Express.User keeps it compatible with
// Passport's verify callback. `scope` is the app audience the access token was
// minted for (added locally so we don't have to rev shared-types).
declare global {
  namespace Express {
    interface User extends AuthPrincipal {
      scope?: Audience;
    }
  }
}

export {};
