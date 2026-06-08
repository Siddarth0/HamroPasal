import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Returns'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

export const returnsPaths = {
  '/returns': {
    post: {
      tags,
      summary: 'Request a return (customer, delivered sub-order)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['subOrderId', 'reason'],
        properties: {
          subOrderId: { type: 'string' },
          reason: { type: 'string' },
          description: { type: 'string' },
        },
      }),
      responses: { 201: ok(ref('Return')), 400: E[400], 404: E[404], 409: E[400] },
    },
    get: { tags, summary: 'List my returns (customer)', security: bearer, responses: { 200: okList(ref('Return')), 401: E[401] } },
  },
  '/returns/seller': {
    get: {
      tags,
      summary: 'List my store returns (seller)',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Return')), 403: E[403] },
    },
  },
  '/returns/seller/{id}': {
    patch: {
      tags,
      summary: 'Resolve a return (seller)',
      description: 'APPROVED (with refundAmount, defaults to subtotal) / REJECTED, then COMPLETED → sub-order REFUNDED.',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'COMPLETED'] },
          refundAmount: { type: 'number' },
        },
      }),
      responses: { 200: ok(ref('Return')), 400: E[400], 403: E[403], 404: E[404] },
    },
  },
  '/returns/{id}': {
    get: { tags, summary: 'Get one of my returns (customer)', security: bearer, parameters: [idParam], responses: { 200: ok(ref('Return')), 404: E[404] } },
  },
};
