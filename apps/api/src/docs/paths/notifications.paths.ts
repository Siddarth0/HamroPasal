import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Notifications'];

export const notificationsPaths = {
  '/notifications': {
    get: {
      tags,
      summary: 'List my notifications',
      description: 'New notifications also arrive in real-time over Socket.io as `notification:new`.',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('AppNotification')), 401: E[401] },
    },
  },
  '/notifications/unread-count': {
    get: { tags, summary: 'Unread count', security: bearer, responses: { 200: ok({ type: 'object', properties: { count: { type: 'integer' } } }), 401: E[401] } },
  },
  '/notifications/read-all': {
    post: { tags, summary: 'Mark all read', security: bearer, responses: { 200: ok({ type: 'object' }), 401: E[401] } },
  },
  '/notifications/{id}/read': {
    patch: { tags, summary: 'Mark one read', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: ok(ref('AppNotification')), 404: E[404] } },
  },
  '/notifications/push/public-key': {
    get: { tags, summary: 'VAPID public key for web push', security: bearer, responses: { 200: ok({ type: 'object', properties: { publicKey: { type: 'string', nullable: true } } }) } },
  },
  '/notifications/push/subscribe': {
    post: {
      tags,
      summary: 'Register a web-push subscription',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['endpoint', 'keys'],
        properties: {
          endpoint: { type: 'string' },
          keys: { type: 'object', properties: { p256dh: { type: 'string' }, auth: { type: 'string' } } },
        },
      }),
      responses: { 200: ok({ type: 'object' }), 400: E[400] },
    },
  },
  '/notifications/push/unsubscribe': {
    post: {
      tags,
      summary: 'Remove a web-push subscription',
      security: bearer,
      requestBody: jsonBody({ type: 'object', required: ['endpoint'], properties: { endpoint: { type: 'string' } } }),
      responses: { 200: ok({ type: 'object' }) },
    },
  },
};
