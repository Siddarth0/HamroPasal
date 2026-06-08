import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Reviews'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

export const reviewsPaths = {
  '/reviews/product/{productId}': {
    get: {
      tags,
      summary: 'List a product\'s reviews (public)',
      parameters: [
        { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Review')) },
    },
  },
  '/reviews': {
    post: {
      tags,
      summary: 'Create a review (verified purchase only)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['productId', 'rating', 'comment'],
        properties: {
          productId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' },
          comment: { type: 'string' },
        },
      }),
      responses: { 201: ok(ref('Review')), 400: E[400], 401: E[401], 403: E[403], 409: E[400] },
    },
  },
  '/reviews/mine': {
    get: { tags, summary: 'List my reviews', security: bearer, responses: { 200: okList(ref('Review')), 401: E[401] } },
  },
  '/reviews/{id}': {
    patch: {
      tags,
      summary: 'Update my review',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({
        type: 'object',
        properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, title: { type: 'string' }, comment: { type: 'string' } },
      }),
      responses: { 200: ok(ref('Review')), 404: E[404] },
    },
    delete: { tags, summary: 'Delete my review (or admin)', security: bearer, parameters: [idParam], responses: { 200: ok({ type: 'object' }), 403: E[403], 404: E[404] } },
  },
  '/reviews/{id}/images': {
    post: {
      tags,
      summary: 'Add review images',
      security: bearer,
      parameters: [idParam],
      requestBody: {
        required: true,
        content: { 'multipart/form-data': { schema: { type: 'object', properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } },
      },
      responses: { 200: ok(ref('Review')), 404: E[404], 503: { description: 'Cloudinary not configured' } },
    },
    delete: { tags, summary: 'Remove a review image', security: bearer, parameters: [idParam], requestBody: jsonBody({ type: 'object', required: ['publicId'], properties: { publicId: { type: 'string' } } }), responses: { 200: ok(ref('Review')), 404: E[404] } },
  },
};
