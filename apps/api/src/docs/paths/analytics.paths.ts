import { bearer, ref, ok, E } from '../helpers';

const tags = ['Analytics'];

export const analyticsPaths = {
  '/analytics/admin': {
    get: {
      tags,
      summary: 'Platform dashboard (admin)',
      description: 'Users/stores/orders counts by status, revenue, commission earned, pending payouts, top products.',
      security: bearer,
      responses: { 200: ok(ref('PlatformStats')), 403: E[403] },
    },
  },
  '/analytics/seller': {
    get: {
      tags,
      summary: 'Seller dashboard',
      description: 'Sub-orders by status, delivered revenue/earnings, product count, top products.',
      security: bearer,
      responses: { 200: ok(ref('SellerStats')), 403: E[403] },
    },
  },
  '/analytics/seller/timeseries': {
    get: {
      tags,
      summary: 'Seller sales trend (time-series)',
      description: 'Gap-filled buckets of orders/sales/earnings. 30d & 90d are daily; 12m is monthly.',
      security: bearer,
      parameters: [{ name: 'range', in: 'query', schema: { type: 'string', enum: ['30d', '90d', '12m'] } }],
      responses: {
        200: ok({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-06-01' },
              orders: { type: 'integer' },
              sales: { type: 'number' },
              earnings: { type: 'number' },
            },
          },
        }),
        403: E[403],
      },
    },
  },
  '/analytics/seller/low-stock': {
    get: {
      tags,
      summary: 'Low-stock products (seller)',
      description: 'Active products whose stock (or any variant stock) is at or below the threshold, most urgent first.',
      security: bearer,
      parameters: [{ name: 'threshold', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 1000, default: 5 } }],
      responses: {
        200: ok({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              stock: { type: 'integer' },
              hasVariants: { type: 'boolean' },
            },
          },
        }),
        403: E[403],
      },
    },
  },
};
