import { bearer, ref, jsonBody, ok, E } from '../helpers';

const tags = ['Categories'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

const imageUpload = {
  required: true,
  content: {
    'multipart/form-data': {
      schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } },
    },
  },
};

export const categoriesPaths = {
  '/categories': {
    get: { tags, summary: 'List active categories (public)', responses: { 200: ok({ type: 'array', items: ref('Category') }) } },
    post: {
      tags,
      summary: 'Create a category (admin)',
      security: bearer,
      requestBody: jsonBody({
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          parentId: { type: 'string' },
          sortOrder: { type: 'integer' },
          isActive: { type: 'boolean' },
        },
      }),
      responses: { 201: ok(ref('Category')), 400: E[400], 403: E[403] },
    },
  },
  '/categories/tree': {
    get: { tags, summary: 'Category tree (public)', responses: { 200: ok({ type: 'array', items: ref('Category') }) } },
  },
  '/categories/{id}': {
    patch: { tags, summary: 'Update a category (admin)', security: bearer, parameters: [idParam], requestBody: jsonBody({ type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, parentId: { type: 'string' }, sortOrder: { type: 'integer' }, isActive: { type: 'boolean' } } }), responses: { 200: ok(ref('Category')), 404: E[404] } },
    delete: { tags, summary: 'Delete a category (admin)', security: bearer, parameters: [idParam], responses: { 200: ok({ type: 'object' }), 404: E[404], 409: E[400] } },
  },
  '/categories/{id}/image': {
    post: { tags, summary: 'Set category image (admin)', security: bearer, parameters: [idParam], requestBody: imageUpload, responses: { 200: ok(ref('Category')), 404: E[404], 503: { description: 'Cloudinary not configured' } } },
    delete: { tags, summary: 'Remove category image (admin)', security: bearer, parameters: [idParam], responses: { 200: ok(ref('Category')), 404: E[404] } },
  },
  '/categories/{slug}': {
    get: { tags, summary: 'Get a category by slug (public)', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: ok(ref('Category')), 404: E[404] } },
  },
};
