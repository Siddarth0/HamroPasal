import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Admin'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

export const adminPaths = {
  '/admin/users': {
    get: {
      tags,
      summary: 'List users (admin)',
      security: bearer,
      parameters: [
        { name: 'role', in: 'query', schema: { type: 'string', enum: ['CUSTOMER', 'SELLER', 'ADMIN'] } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('AdminUser')), 403: E[403] },
    },
  },
  '/admin/users/{id}': {
    get: { tags, summary: 'Get a user (admin)', security: bearer, parameters: [idParam], responses: { 200: ok(ref('AdminUser')), 404: E[404] } },
    patch: {
      tags,
      summary: 'Update a user: activate/suspend, change role (admin)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
          role: { type: 'string', enum: ['CUSTOMER', 'SELLER', 'ADMIN'] },
        },
      }),
      responses: { 200: ok(ref('AdminUser')), 400: E[400], 404: E[404] },
    },
  },
  '/admin/orders': {
    get: {
      tags,
      summary: 'List all orders (admin)',
      security: bearer,
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'paymentStatus', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Order')), 403: E[403] },
    },
  },
  '/admin/orders/{id}': {
    get: { tags, summary: 'Get any order (admin)', security: bearer, parameters: [idParam], responses: { 200: ok(ref('Order')), 404: E[404] } },
  },
  '/admin/products': {
    get: {
      tags,
      summary: 'List all products incl. inactive (admin)',
      security: bearer,
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'storeId', in: 'query', schema: { type: 'string' } },
        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Product')), 403: E[403] },
    },
  },
  '/admin/products/{id}': {
    patch: {
      tags,
      summary: 'Toggle product active (admin)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({ type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } } }),
      responses: { 200: ok(ref('Product')), 404: E[404] },
    },
    delete: { tags, summary: 'Delete any product (admin)', security: bearer, parameters: [idParam], responses: { 200: ok({ type: 'object' }), 404: E[404] } },
  },
};
