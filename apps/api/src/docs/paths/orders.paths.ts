import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Orders'];

export const ordersPaths = {
  '/orders/checkout': {
    post: {
      tags,
      summary: 'Checkout (auth + verified email)',
      description: 'Validates the cart, computes per-store shipping, splits into sub-orders with commission, reserves stock, and clears the cart.',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['addressId', 'paymentMethod'],
        properties: {
          addressId: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['COD', 'KHALTI', 'ESEWA', 'STRIPE'] },
          couponCode: { type: 'string', description: 'Optional coupon to apply' },
          redeemPoints: { type: 'integer', description: 'Optional loyalty points to redeem' },
        },
      }),
      responses: { 201: ok(ref('Order'), 'Order placed'), 400: E[400], 401: E[401], 403: E[403], 409: E[400] },
    },
  },
  '/orders': {
    get: {
      tags,
      summary: 'List my orders',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Order')), 401: E[401] },
    },
  },
  '/orders/seller': {
    get: {
      tags,
      summary: 'List my store sub-orders (seller)',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('SubOrder')), 403: E[403] },
    },
  },
  '/orders/seller/sub-orders/{id}/status': {
    patch: {
      tags,
      summary: 'Update sub-order status (seller)',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: jsonBody({
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
        },
      }),
      responses: { 200: ok(ref('SubOrder')), 400: E[400], 403: E[403], 404: E[404] },
    },
  },
  '/orders/{id}': {
    get: {
      tags,
      summary: 'Get one of my orders',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: ok(ref('Order')), 401: E[401], 404: E[404] },
    },
  },
  '/orders/{id}/cancel': {
    post: {
      tags,
      summary: 'Cancel an order (while PENDING/CONFIRMED)',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: ok(ref('Order')), 400: E[400], 401: E[401], 404: E[404] },
    },
  },
};
