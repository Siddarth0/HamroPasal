import { bearer, ref, ok, okList, E } from '../helpers';

const tags = ['Loyalty'];

export const loyaltyPaths = {
  '/loyalty/balance': {
    get: {
      tags,
      summary: 'My loyalty points balance',
      security: bearer,
      responses: {
        200: ok({ type: 'object', properties: { points: { type: 'integer' }, redeemRate: { type: 'number' }, earnRate: { type: 'number' } } }),
        401: E[401],
      },
    },
  },
  '/loyalty/transactions': {
    get: {
      tags,
      summary: 'My loyalty ledger',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('LoyaltyTransaction')), 401: E[401] },
    },
  },
};
