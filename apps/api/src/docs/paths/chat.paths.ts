import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Chat'];

export const chatPaths = {
  '/chat/messages': {
    post: {
      tags,
      summary: 'Send a message',
      description:
        'Start a thread with { storeId, productId? } (customer) or reply with { conversationId }. Also available over Socket.io as `chat:send`. Real-time delivery via the `chat:message` event.',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string' },
          conversationId: { type: 'string' },
          storeId: { type: 'string' },
          productId: { type: 'string', description: 'Attach a product card to the message' },
        },
      }),
      responses: { 201: ok(ref('ChatMessage')), 400: E[400], 401: E[401], 403: E[403], 404: E[404] },
    },
  },
  '/chat/conversations': {
    get: {
      tags,
      summary: 'My conversations (inbox)',
      security: bearer,
      responses: { 200: ok({ type: 'array', items: ref('ConversationSummary') }), 401: E[401] },
    },
  },
  '/chat/conversations/{id}/messages': {
    get: {
      tags,
      summary: 'Message history (marks as read)',
      security: bearer,
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: { 200: okList(ref('ChatMessage')), 403: E[403], 404: E[404] },
    },
  },
  '/chat/conversations/{id}/read': {
    post: {
      tags,
      summary: 'Mark a conversation read',
      security: bearer,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: ok({ type: 'object' }), 403: E[403], 404: E[404] },
    },
  },
};
