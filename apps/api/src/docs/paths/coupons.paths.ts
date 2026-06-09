import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Coupons'];

export const couponsPaths = {
  '/coupons/validate': {
    post: {
      tags,
      summary: 'Validate a coupon against my cart',
      security: bearer,
      requestBody: jsonBody({ type: 'object', required: ['code'], properties: { code: { type: 'string' } } }),
      responses: {
        200: ok({ type: 'object', properties: { code: { type: 'string' }, discountType: { type: 'string' }, discount: { type: 'number' } } }),
        400: E[400],
        401: E[401],
      },
    },
  },
  '/coupons': {
    post: {
      tags,
      summary: 'Create a coupon (seller scopes to own store; admin platform-wide or any store)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['code', 'discountType', 'discountValue'],
        properties: {
          code: { type: 'string' },
          description: { type: 'string' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FLAT'] },
          discountValue: { type: 'number' },
          minOrderAmount: { type: 'number' },
          maxDiscount: { type: 'number' },
          usageLimit: { type: 'integer' },
          startsAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          storeId: { type: 'string', description: 'Admin only' },
        },
      }),
      responses: { 201: ok(ref('Coupon')), 400: E[400], 403: E[403], 409: E[400] },
    },
  },
  '/coupons/mine': {
    get: { tags, summary: 'My store coupons (seller)', security: bearer, responses: { 200: okList(ref('Coupon')), 403: E[403] } },
  },
  '/coupons/admin': {
    get: {
      tags,
      summary: 'All coupons (admin)',
      security: bearer,
      parameters: [
        { name: 'storeId', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Coupon')), 403: E[403] },
    },
  },
  '/coupons/{id}': {
    patch: {
      tags,
      summary: 'Update / deactivate a coupon (owner seller or admin)',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: jsonBody({
        type: 'object',
        properties: {
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          usageLimit: { type: 'integer' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      }),
      responses: { 200: ok(ref('Coupon')), 403: E[403], 404: E[404] },
    },
  },
};
