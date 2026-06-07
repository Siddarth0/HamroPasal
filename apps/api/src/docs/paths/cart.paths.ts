import { bearer, ref, jsonBody, ok, E } from '../helpers';

const tags = ['Cart'];

export const cartPaths = {
  '/cart': {
    get: { tags, summary: 'Get my cart (grouped by store, live-validated)', security: bearer, responses: { 200: ok(ref('CartView')), 401: E[401] } },
    delete: { tags, summary: 'Clear my cart', security: bearer, responses: { 200: ok(ref('CartView')), 401: E[401] } },
  },
  '/cart/items': {
    post: {
      tags,
      summary: 'Add an item to cart',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string' },
          variantId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, default: 1 },
        },
      }),
      responses: { 200: ok(ref('CartView')), 400: E[400], 401: E[401], 404: E[404] },
    },
    patch: {
      tags,
      summary: 'Update an item quantity (0 removes)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string' },
          variantId: { type: 'string' },
          quantity: { type: 'integer', minimum: 0 },
        },
      }),
      responses: { 200: ok(ref('CartView')), 400: E[400], 401: E[401], 404: E[404] },
    },
  },
  '/cart/items/{productId}': {
    delete: {
      tags,
      summary: 'Remove an item',
      security: bearer,
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'variantId', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: ok(ref('CartView')), 401: E[401], 404: E[404] },
    },
  },
};
