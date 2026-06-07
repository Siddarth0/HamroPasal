// Small builders to keep per-module path docs concise.

export const bearer = [{ bearerAuth: [] }];

export const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

export const jsonBody = (schema: Record<string, unknown>, required = true) => ({
  required,
  content: { 'application/json': { schema } },
});

/** Success response whose body's `data` is `schema` (entity or inline). */
export const ok = (schema: Record<string, unknown>, description = 'Success') => ({
  description,
  content: { 'application/json': { schema } },
});

/** Paginated success response (data array + meta). */
export const okList = (
  itemRef: Record<string, unknown>,
  description = 'Paginated list',
) => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array', items: itemRef },
          meta: ref('PaginationMeta'),
        },
      },
    },
  },
});

// Reusable error response refs.
export const E = {
  400: { $ref: '#/components/responses/ValidationError' },
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' },
  404: { $ref: '#/components/responses/NotFound' },
} as const;
