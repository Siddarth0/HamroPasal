import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Payouts'];

export const payoutsPaths = {
  '/payouts': {
    get: {
      tags,
      summary: 'List my store payouts (seller)',
      security: bearer,
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Payout')), 403: E[403] },
    },
  },
  '/payouts/earnings': {
    get: {
      tags,
      summary: 'My earnings summary (seller)',
      security: bearer,
      responses: { 200: ok(ref('SellerEarnings')), 403: E[403] },
    },
  },
  '/payouts/admin': {
    get: {
      tags,
      summary: 'List all payouts (admin)',
      security: bearer,
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] } },
        { name: 'storeId', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Payout')), 403: E[403] },
    },
  },
  '/payouts/admin/generate': {
    post: {
      tags,
      summary: 'Generate payouts for delivered sub-orders (admin)',
      description: 'Creates a PENDING payout (= sellerEarning) for each DELIVERED sub-order without one. Idempotent.',
      security: bearer,
      responses: { 200: ok({ type: 'object', properties: { created: { type: 'integer' } } }), 403: E[403] },
    },
  },
  '/payouts/admin/{id}': {
    patch: {
      tags,
      summary: 'Update a payout status (admin)',
      description: 'PENDING → PROCESSING/COMPLETED/FAILED; PROCESSING → COMPLETED/FAILED; FAILED → PENDING (retry).',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: jsonBody({
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'PENDING'] },
          method: { type: 'string' },
          reference: { type: 'string' },
        },
      }),
      responses: { 200: ok(ref('Payout')), 400: E[400], 403: E[403], 404: E[404] },
    },
  },
};
