import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Questions'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

export const questionsPaths = {
  '/questions/product/{productId}': {
    get: {
      tags,
      summary: "List a product's questions (public)",
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Question')) },
    },
  },
  '/questions': {
    post: {
      tags,
      summary: 'Ask a question about a product',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['productId', 'question'],
        properties: { productId: { type: 'string' }, question: { type: 'string' } },
      }),
      responses: { 201: ok(ref('Question')), 400: E[400], 401: E[401], 404: E[404] },
    },
  },
  '/questions/{id}/answer': {
    post: {
      tags,
      summary: 'Answer a question (store owner or admin)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({
        type: 'object',
        required: ['answer'],
        properties: { answer: { type: 'string' } },
      }),
      responses: { 200: ok(ref('Question')), 401: E[401], 403: E[403], 404: E[404] },
    },
  },
  '/questions/{id}': {
    delete: {
      tags,
      summary: 'Delete a question (asker or admin)',
      security: bearer,
      parameters: [idParam],
      responses: { 200: ok({ type: 'object' }), 403: E[403], 404: E[404] },
    },
  },
};
