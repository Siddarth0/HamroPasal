import { ref, jsonBody, ok, E } from '../helpers';

export const shippingPaths = {
  '/shipping/quote': {
    post: {
      tags: ['Shipping'],
      summary: 'Get per-store shipping quotes (public)',
      description: 'For a delivery point, returns deliverability + fee per store using Haversine distance vs each store\'s delivery zones.',
      requestBody: jsonBody({
        type: 'object',
        required: ['latitude', 'longitude', 'storeIds'],
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          storeIds: { type: 'array', items: { type: 'string' } },
        },
      }),
      responses: { 200: ok({ type: 'array', items: ref('ShippingQuote') }), 400: E[400] },
    },
  },
};
