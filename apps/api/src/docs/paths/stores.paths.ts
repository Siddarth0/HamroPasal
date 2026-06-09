import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Stores'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

const zoneBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    distanceKm: { type: 'number' },
    shippingFee: { type: 'number' },
    isActive: { type: 'boolean' },
  },
};

export const storesPaths = {
  '/stores': {
    get: {
      tags,
      summary: 'Browse active stores (public)',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: okList(ref('Store')) },
    },
    post: {
      tags,
      summary: 'Apply for a store (seller)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          addressLine: { type: 'string' },
          city: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
      }),
      responses: { 201: ok(ref('Store'), 'Submitted for approval'), 401: E[401], 403: E[403], 409: E[400] },
    },
  },
  '/stores/me': {
    get: { tags, summary: 'Get my store (seller)', security: bearer, responses: { 200: ok(ref('Store')), 404: E[404] } },
    patch: {
      tags,
      summary: 'Update my store (seller)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          addressLine: { type: 'string' },
          city: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          logoUrl: { type: 'string', format: 'uri' },
          coverUrl: { type: 'string', format: 'uri' },
        },
      }),
      responses: { 200: ok(ref('Store')), 404: E[404] },
    },
  },
  '/stores/me/logo': {
    post: {
      tags,
      summary: 'Upload store logo (seller)',
      security: bearer,
      requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { logo: { type: 'string', format: 'binary' } } } } } },
      responses: { 200: ok(ref('Store')), 400: E[400], 404: E[404], 503: { description: 'Cloudinary not configured' } },
    },
  },
  '/stores/me/cover': {
    post: {
      tags,
      summary: 'Upload store cover (seller)',
      security: bearer,
      requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { cover: { type: 'string', format: 'binary' } } } } } },
      responses: { 200: ok(ref('Store')), 400: E[400], 404: E[404], 503: { description: 'Cloudinary not configured' } },
    },
  },
  '/stores/me/delivery-zones': {
    get: { tags, summary: 'List my delivery zones (seller)', security: bearer, responses: { 200: ok({ type: 'array', items: ref('DeliveryZone') }) } },
    post: { tags, summary: 'Add a delivery zone (seller)', security: bearer, requestBody: jsonBody({ ...zoneBody, required: ['name', 'distanceKm', 'shippingFee'] }), responses: { 201: ok(ref('DeliveryZone')), 400: E[400] } },
  },
  '/stores/me/delivery-zones/{id}': {
    patch: { tags, summary: 'Update a delivery zone (seller)', security: bearer, parameters: [idParam], requestBody: jsonBody(zoneBody), responses: { 200: ok(ref('DeliveryZone')), 404: E[404] } },
    delete: { tags, summary: 'Delete a delivery zone (seller)', security: bearer, parameters: [idParam], responses: { 200: ok({ type: 'object' }), 404: E[404] } },
  },
  '/stores/admin': {
    get: {
      tags,
      summary: 'List stores (admin)',
      security: bearer,
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED'] } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('Store')), 403: E[403] },
    },
  },
  '/stores/admin/{id}': {
    patch: {
      tags,
      summary: 'Approve/suspend a store or set commission (admin)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED'] },
          commissionRate: { type: 'number', minimum: 0, maximum: 100 },
        },
      }),
      responses: { 200: ok(ref('Store')), 403: E[403], 404: E[404] },
    },
  },
  '/stores/{slug}': {
    get: {
      tags,
      summary: 'Get a store by slug (public)',
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: ok(ref('Store')), 404: E[404] },
    },
  },
};
