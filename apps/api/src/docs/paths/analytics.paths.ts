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
};
