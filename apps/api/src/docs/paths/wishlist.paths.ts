import { bearer, ref, jsonBody, ok, E } from '../helpers';

const tags = ['Wishlist'];

export const wishlistPaths = {
  '/wishlist': {
    get: { tags, summary: 'Get my wishlist (populated products)', security: bearer, responses: { 200: ok({ type: 'array', items: ref('Product') }), 401: E[401] } },
  },
  '/wishlist/items': {
    post: {
      tags,
      summary: 'Add a product to wishlist',
      security: bearer,
      requestBody: jsonBody({ type: 'object', required: ['productId'], properties: { productId: { type: 'string' } } }),
      responses: { 200: ok({ type: 'array', items: ref('Product') }), 401: E[401], 404: E[404] },
    },
  },
  '/wishlist/items/{productId}': {
    delete: {
      tags,
      summary: 'Remove a product from wishlist',
      security: bearer,
      parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: ok({ type: 'array', items: ref('Product') }), 401: E[401] },
    },
  },
};
