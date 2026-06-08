// Reusable OpenAPI components: security scheme, entity schemas (mirroring
// shared-types), and common error responses. Schemas describe the `data`
// payload — every response is wrapped in the standard { success, message, data }
// envelope (see the API description in openapi.ts).

export const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Access token from /auth/login or /auth/register.',
  },
} as const;

export const schemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: { field: { type: 'string' }, message: { type: 'string' } },
        },
      },
    },
  },
  PaginationMeta: {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      page: { type: 'integer' },
      limit: { type: 'integer' },
      totalPages: { type: 'integer' },
      hasNextPage: { type: 'boolean' },
      hasPrevPage: { type: 'boolean' },
    },
  },
  ImageRef: {
    type: 'object',
    properties: { url: { type: 'string' }, publicId: { type: 'string' } },
  },

  PublicUser: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      phone: { type: 'string', nullable: true },
      avatarUrl: { type: 'string', nullable: true },
      role: { type: 'string', enum: ['CUSTOMER', 'SELLER', 'ADMIN'] },
      isEmailVerified: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  AuthResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/PublicUser' },
      accessToken: { type: 'string' },
    },
  },
  Address: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      label: { type: 'string' },
      fullName: { type: 'string' },
      phone: { type: 'string' },
      addressLine: { type: 'string' },
      city: { type: 'string' },
      district: { type: 'string' },
      latitude: { type: 'number', nullable: true },
      longitude: { type: 'number', nullable: true },
      isDefault: { type: 'boolean' },
    },
  },

  Store: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      ownerId: { type: 'string' },
      name: { type: 'string' },
      slug: { type: 'string' },
      description: { type: 'string', nullable: true },
      logoUrl: { type: 'string', nullable: true },
      coverUrl: { type: 'string', nullable: true },
      city: { type: 'string', nullable: true },
      latitude: { type: 'number', nullable: true },
      longitude: { type: 'number', nullable: true },
      status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED'] },
      commissionRate: { type: 'number' },
    },
  },
  DeliveryZone: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      storeId: { type: 'string' },
      name: { type: 'string' },
      distanceKm: { type: 'number' },
      shippingFee: { type: 'number' },
      isActive: { type: 'boolean' },
    },
  },
  ShippingQuote: {
    type: 'object',
    properties: {
      storeId: { type: 'string' },
      deliverable: { type: 'boolean' },
      distanceKm: { type: 'number', nullable: true },
      shippingFee: { type: 'number', nullable: true },
      zoneName: { type: 'string' },
      reason: { type: 'string' },
    },
  },

  Category: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      slug: { type: 'string' },
      description: { type: 'string' },
      image: { $ref: '#/components/schemas/ImageRef' },
      parentId: { type: 'string', nullable: true },
      isActive: { type: 'boolean' },
      sortOrder: { type: 'integer' },
    },
  },
  ProductVariant: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string' },
      price: { type: 'number' },
      comparePrice: { type: 'number' },
      stock: { type: 'integer' },
      sku: { type: 'string' },
      attributes: { type: 'object', additionalProperties: { type: 'string' } },
    },
  },
  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      storeId: { type: 'string' },
      categoryId: { type: 'string' },
      name: { type: 'string' },
      slug: { type: 'string' },
      description: { type: 'string' },
      images: { type: 'array', items: { $ref: '#/components/schemas/ImageRef' } },
      price: { type: 'number' },
      comparePrice: { type: 'number' },
      stock: { type: 'integer' },
      variants: { type: 'array', items: { $ref: '#/components/schemas/ProductVariant' } },
      tags: { type: 'array', items: { type: 'string' } },
      isActive: { type: 'boolean' },
      avgRating: { type: 'number' },
      reviewCount: { type: 'integer' },
      soldCount: { type: 'integer' },
    },
  },

  Review: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      productId: { type: 'string' },
      userId: { type: 'string' },
      storeId: { type: 'string' },
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      title: { type: 'string' },
      comment: { type: 'string' },
      images: { type: 'array', items: { $ref: '#/components/schemas/ImageRef' } },
      isVerifiedPurchase: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Return: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      subOrderId: { type: 'string' },
      reason: { type: 'string' },
      description: { type: 'string', nullable: true },
      status: { type: 'string', enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'] },
      refundAmount: { type: 'number', nullable: true },
      resolvedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  ChatMessage: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      conversationId: { type: 'string' },
      senderId: { type: 'string' },
      senderRole: { type: 'string', enum: ['CUSTOMER', 'SELLER'] },
      text: { type: 'string' },
      product: {
        type: 'object',
        nullable: true,
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          image: { type: 'string' },
          price: { type: 'number' },
        },
      },
      isRead: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  ConversationSummary: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      storeId: { type: 'string' },
      lastMessage: { type: 'object', nullable: true },
      unread: { type: 'integer' },
      counterpart: { type: 'object' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  AppNotification: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
      data: { type: 'object', additionalProperties: { type: 'string' } },
      isRead: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  PlatformStats: {
    type: 'object',
    properties: {
      users: { type: 'object', additionalProperties: { type: 'integer' } },
      stores: { type: 'object', additionalProperties: { type: 'integer' } },
      orders: { type: 'object', additionalProperties: { type: 'integer' } },
      revenue: { type: 'number' },
      commissionEarned: { type: 'number' },
      pendingPayouts: { type: 'number' },
      topProducts: { type: 'array', items: { type: 'object' } },
    },
  },
  SellerStats: {
    type: 'object',
    properties: {
      subOrders: { type: 'object', additionalProperties: { type: 'integer' } },
      deliveredRevenue: { type: 'number' },
      deliveredEarnings: { type: 'number' },
      productCount: { type: 'integer' },
      topProducts: { type: 'array', items: { type: 'object' } },
    },
  },
  AdminUser: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      phone: { type: 'string', nullable: true },
      role: { type: 'string', enum: ['CUSTOMER', 'SELLER', 'ADMIN'] },
      isActive: { type: 'boolean' },
      isEmailVerified: { type: 'boolean' },
      store: { type: 'object', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Payout: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      storeId: { type: 'string' },
      subOrderId: { type: 'string' },
      amount: { type: 'number' },
      status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
      method: { type: 'string', nullable: true },
      reference: { type: 'string', nullable: true },
      processedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  SellerEarnings: {
    type: 'object',
    properties: {
      delivered: {
        type: 'object',
        properties: { count: { type: 'integer' }, earnings: { type: 'number' } },
      },
      payouts: {
        type: 'object',
        properties: {
          pending: { type: 'number' },
          processing: { type: 'number' },
          completed: { type: 'number' },
          failed: { type: 'number' },
        },
      },
    },
  },
  CartLineItem: {
    type: 'object',
    properties: {
      productId: { type: 'string' },
      variantId: { type: 'string' },
      name: { type: 'string' },
      imageUrl: { type: 'string' },
      price: { type: 'number' },
      quantity: { type: 'integer' },
      lineTotal: { type: 'number' },
      available: { type: 'boolean' },
      inStock: { type: 'boolean' },
      maxStock: { type: 'integer' },
      storeId: { type: 'string' },
    },
  },
  CartView: {
    type: 'object',
    properties: {
      stores: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            storeId: { type: 'string' },
            storeName: { type: 'string' },
            storeSlug: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/CartLineItem' } },
            subtotal: { type: 'number' },
          },
        },
      },
      totalQuantity: { type: 'integer' },
      subtotal: { type: 'number' },
    },
  },

  OrderItem: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      productId: { type: 'string' },
      variantId: { type: 'string', nullable: true },
      name: { type: 'string' },
      imageUrl: { type: 'string', nullable: true },
      price: { type: 'number' },
      quantity: { type: 'integer' },
    },
  },
  SubOrder: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      orderId: { type: 'string' },
      storeId: { type: 'string' },
      subtotal: { type: 'number' },
      shippingFee: { type: 'number' },
      commissionFee: { type: 'number' },
      sellerEarning: { type: 'number' },
      status: {
        type: 'string',
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
      },
      orderItems: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
    },
  },
  Order: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      totalAmount: { type: 'number' },
      shippingFee: { type: 'number' },
      discountAmount: { type: 'number' },
      deliveryAddress: { type: 'string', nullable: true },
      status: {
        type: 'string',
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
      },
      paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
      paymentMethod: { type: 'string', enum: ['COD', 'KHALTI', 'ESEWA', 'STRIPE'] },
      subOrders: { type: 'array', items: { $ref: '#/components/schemas/SubOrder' } },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
} as const;

const errorContent = {
  'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
};

export const responses = {
  ValidationError: { description: 'Validation failed', content: errorContent },
  Unauthorized: { description: 'Missing or invalid access token', content: errorContent },
  Forbidden: { description: 'Insufficient permissions', content: errorContent },
  NotFound: { description: 'Resource not found', content: errorContent },
} as const;
