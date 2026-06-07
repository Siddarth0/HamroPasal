import { bearer, ref, jsonBody, ok, E } from '../helpers';

const tags = ['Users'];
const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
};

const addressBody = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    fullName: { type: 'string' },
    phone: { type: 'string' },
    addressLine: { type: 'string' },
    city: { type: 'string' },
    district: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    isDefault: { type: 'boolean' },
  },
};

export const usersPaths = {
  '/users/me': {
    get: {
      tags,
      summary: 'Get my profile',
      security: bearer,
      responses: { 200: ok(ref('PublicUser')), 401: E[401] },
    },
    patch: {
      tags,
      summary: 'Update my profile',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
        },
      }),
      responses: { 200: ok(ref('PublicUser')), 401: E[401] },
    },
  },
  '/users/addresses': {
    get: {
      tags,
      summary: 'List my addresses',
      security: bearer,
      responses: { 200: ok({ type: 'array', items: ref('Address') }), 401: E[401] },
    },
    post: {
      tags,
      summary: 'Add an address',
      security: bearer,
      requestBody: jsonBody({
        ...addressBody,
        required: ['fullName', 'phone', 'addressLine', 'city', 'district'],
      }),
      responses: { 201: ok(ref('Address')), 400: E[400], 401: E[401] },
    },
  },
  '/users/addresses/{id}': {
    patch: {
      tags,
      summary: 'Update an address',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody(addressBody),
      responses: { 200: ok(ref('Address')), 401: E[401], 404: E[404] },
    },
    delete: {
      tags,
      summary: 'Delete an address',
      security: bearer,
      parameters: [idParam],
      responses: { 200: ok({ type: 'object' }), 401: E[401], 404: E[404] },
    },
  },
  '/users/addresses/{id}/default': {
    patch: {
      tags,
      summary: 'Set an address as default',
      security: bearer,
      parameters: [idParam],
      responses: { 200: ok(ref('Address')), 401: E[401], 404: E[404] },
    },
  },
};
