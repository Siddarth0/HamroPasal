import { env } from '@/config/env';
import { schemas, securitySchemes, responses } from './components';
import { authPaths } from './paths/auth.paths';
import { usersPaths } from './paths/users.paths';
import { storesPaths } from './paths/stores.paths';
import { shippingPaths } from './paths/shipping.paths';
import { categoriesPaths } from './paths/categories.paths';
import { productsPaths } from './paths/products.paths';
import { cartPaths } from './paths/cart.paths';
import { wishlistPaths } from './paths/wishlist.paths';
import { ordersPaths } from './paths/orders.paths';

// The OpenAPI 3.1 document — single source for /docs (Swagger UI) and /reference
// (Scalar). To document a NEW endpoint, add it to the matching file in
// docs/paths/ (and any new entity to docs/components.ts), then it shows up here.

export const openapiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Multi-Vendor Ecommerce API',
    version: '1.0.0',
    description: [
      'Backend API for the multi-vendor marketplace.',
      '',
      '**Response envelope:** all successful responses are wrapped as ' +
        '`{ success: true, message: string, data?: T }` (paginated lists also include `meta`). ' +
        'The schemas below describe the `data` payload. Errors are ' +
        '`{ success: false, message: string, errors?: [...] }`.',
      '',
      '**Auth:** send `Authorization: Bearer <accessToken>` for protected routes.',
    ].join('\n'),
  },
  servers: [{ url: `http://localhost:${env.PORT}/api`, description: 'Local' }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Stores' },
    { name: 'Shipping' },
    { name: 'Categories' },
    { name: 'Products' },
    { name: 'Cart' },
    { name: 'Wishlist' },
    { name: 'Orders' },
  ],
  paths: {
    ...authPaths,
    ...usersPaths,
    ...storesPaths,
    ...shippingPaths,
    ...categoriesPaths,
    ...productsPaths,
    ...cartPaths,
    ...wishlistPaths,
    ...ordersPaths,
  },
  components: {
    securitySchemes,
    schemas,
    responses,
  },
};
