import { bearer, jsonBody, ok, E } from '../helpers';

const tags = ['Payments'];

export const paymentsPaths = {
  '/payments/initiate': {
    post: {
      tags,
      summary: 'Initiate payment for an order (unified)',
      description:
        'Dispatches by the order\'s paymentMethod. COD confirms inline; KHALTI returns { paymentUrl, pidx }; ESEWA returns a signed { url, fields } form to auto-submit; STRIPE returns { clientSecret }.',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['orderId'],
        properties: { orderId: { type: 'string' } },
      }),
      responses: {
        200: ok(
          {
            type: 'object',
            properties: {
              method: { type: 'string', enum: ['COD', 'KHALTI', 'ESEWA', 'STRIPE'] },
              message: { type: 'string' },
              paymentUrl: { type: 'string' },
              pidx: { type: 'string' },
              url: { type: 'string' },
              fields: { type: 'object', additionalProperties: { type: 'string' } },
              clientSecret: { type: 'string' },
            },
          },
          'Payment initiated',
        ),
        400: E[400],
        401: E[401],
        404: E[404],
        503: { description: 'Selected gateway is not configured' },
      },
    },
  },
  '/payments/khalti/callback': {
    get: {
      tags,
      summary: 'Khalti return URL (server-verified)',
      description: 'Khalti redirects here with ?pidx; the server verifies via lookup and redirects to the client success/failure page.',
      parameters: [{ name: 'pidx', in: 'query', schema: { type: 'string' } }],
      responses: { 302: { description: 'Redirect to client app' } },
    },
  },
  '/payments/esewa/callback': {
    get: {
      tags,
      summary: 'eSewa success URL (server-verified)',
      description: 'eSewa redirects here with ?data (base64); the server verifies the signature and redirects to the client success/failure page.',
      parameters: [{ name: 'data', in: 'query', schema: { type: 'string' } }],
      responses: { 302: { description: 'Redirect to client app' } },
    },
  },
  '/payments/stripe/webhook': {
    post: {
      tags,
      summary: 'Stripe webhook',
      description: 'Receives signed Stripe events (raw body). Marks the order paid on payment_intent.succeeded. Not called directly by clients.',
      responses: { 200: { description: 'Acknowledged' }, 400: E[400] },
    },
  },
};
