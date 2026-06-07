import { bearer, ref, jsonBody, ok, okList, E } from '../helpers';

const tags = ['Products'];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };

const productBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    categoryId: { type: 'string' },
    price: { type: 'number' },
    comparePrice: { type: 'number' },
    stock: { type: 'integer' },
    sku: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    variants: { type: 'array', items: ref('ProductVariant') },
    attributes: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' }, values: { type: 'array', items: { type: 'string' } } } },
    },
    weight: { type: 'number' },
    dimensions: { type: 'object', properties: { length: { type: 'number' }, width: { type: 'number' }, height: { type: 'number' } } },
    isActive: { type: 'boolean' },
  },
};

export const productsPaths = {
  '/products': {
    get: {
      tags,
      summary: 'Browse products (public)',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'categoryId', in: 'query', schema: { type: 'string' } },
        { name: 'storeId', in: 'query', schema: { type: 'string' } },
        { name: 'tag', in: 'query', schema: { type: 'string' } },
        { name: 'minPrice', in: 'query', schema: { type: 'number' } },
        { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'rating', 'popular'] } },
      ],
      responses: { 200: okList(ref('Product')) },
    },
    post: {
      tags,
      summary: 'Create a product (seller)',
      security: bearer,
      requestBody: jsonBody({ ...productBody, required: ['name', 'description', 'categoryId', 'price'] }),
      responses: { 201: ok(ref('Product')), 400: E[400], 403: E[403] },
    },
  },
  '/products/mine': {
    get: {
      tags,
      summary: 'List my store products (seller)',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: { 200: okList(ref('Product')), 403: E[403] },
    },
  },
  '/products/mine/{id}': {
    get: { tags, summary: 'Get one of my products (seller)', security: bearer, parameters: [idParam], responses: { 200: ok(ref('Product')), 404: E[404] } },
  },
  '/products/{id}': {
    patch: { tags, summary: 'Update a product (seller)', security: bearer, parameters: [idParam], requestBody: jsonBody(productBody), responses: { 200: ok(ref('Product')), 404: E[404] } },
    delete: { tags, summary: 'Delete a product (seller)', security: bearer, parameters: [idParam], responses: { 200: ok({ type: 'object' }), 404: E[404] } },
  },
  '/products/{id}/images': {
    post: {
      tags,
      summary: 'Add product images (seller)',
      security: bearer,
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { type: 'object', properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } } },
          },
        },
      },
      responses: { 200: ok(ref('Product')), 404: E[404], 503: { description: 'Cloudinary not configured' } },
    },
    delete: {
      tags,
      summary: 'Remove a product image (seller)',
      security: bearer,
      parameters: [idParam],
      requestBody: jsonBody({ type: 'object', required: ['publicId'], properties: { publicId: { type: 'string' } } }),
      responses: { 200: ok(ref('Product')), 404: E[404] },
    },
  },
  '/products/{slug}': {
    get: { tags, summary: 'Get a product by slug (public)', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: ok(ref('Product')), 404: E[404] } },
  },
};
