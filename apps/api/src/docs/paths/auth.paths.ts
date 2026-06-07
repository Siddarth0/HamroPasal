import { bearer, ref, jsonBody, ok, E } from '../helpers';

const tags = ['Auth'];

export const authPaths = {
  '/auth/register': {
    post: {
      tags,
      summary: 'Register (customer or seller)',
      description: 'Creates an account and sends an email-verification OTP. ADMIN is not self-registerable.',
      requestBody: jsonBody({
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', minLength: 2 },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['CUSTOMER', 'SELLER'], default: 'CUSTOMER' },
        },
      }),
      responses: { 201: ok(ref('AuthResponse'), 'Registered'), 400: E[400], 409: E[400] },
    },
  },
  '/auth/login': {
    post: {
      tags,
      summary: 'Login',
      description: 'Returns an access token in the body and sets the refresh-token httpOnly cookie.',
      requestBody: jsonBody({
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      }),
      responses: { 200: ok(ref('AuthResponse'), 'Logged in'), 401: E[401] },
    },
  },
  '/auth/refresh': {
    post: {
      tags,
      summary: 'Rotate tokens',
      description: 'Uses the refresh-token cookie (or body) to issue a new access token and rotate the refresh token.',
      responses: { 200: ok({ type: 'object', properties: { accessToken: { type: 'string' } } }), 401: E[401] },
    },
  },
  '/auth/verify-email': {
    post: {
      tags,
      summary: 'Verify email with OTP',
      requestBody: jsonBody({
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', pattern: '^\\d{6}$' },
        },
      }),
      responses: { 200: ok({ type: 'object' }, 'Email verified'), 400: E[400] },
    },
  },
  '/auth/resend-verification': {
    post: {
      tags,
      summary: 'Resend verification OTP',
      requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
      responses: { 200: ok({ type: 'object' }) },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags,
      summary: 'Request a password-reset OTP',
      requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
      responses: { 200: ok({ type: 'object' }) },
    },
  },
  '/auth/reset-password': {
    post: {
      tags,
      summary: 'Reset password with OTP',
      requestBody: jsonBody({
        type: 'object',
        required: ['email', 'otp', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', pattern: '^\\d{6}$' },
          password: { type: 'string', minLength: 8 },
        },
      }),
      responses: { 200: ok({ type: 'object' }, 'Password reset'), 400: E[400] },
    },
  },
  '/auth/change-password': {
    post: {
      tags,
      summary: 'Change password (authenticated)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      }),
      responses: { 200: ok({ type: 'object' }, 'Password changed'), 401: E[401] },
    },
  },
  '/auth/logout': {
    post: {
      tags,
      summary: 'Logout',
      security: bearer,
      responses: { 200: ok({ type: 'object' }, 'Logged out'), 401: E[401] },
    },
  },
  '/auth/google': {
    get: {
      tags,
      summary: 'Start Google OAuth',
      description: 'Redirects to Google. 503 if Google OAuth is not configured.',
      responses: { 302: { description: 'Redirect to Google' }, 503: { description: 'Not configured' } },
    },
  },
  '/auth/google/callback': {
    get: {
      tags,
      summary: 'Google OAuth callback',
      description: 'Sets the refresh cookie and redirects to the client app with an access token.',
      responses: { 302: { description: 'Redirect to client app' } },
    },
  },
};
