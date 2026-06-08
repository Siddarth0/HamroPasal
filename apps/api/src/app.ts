import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { apiReference } from '@scalar/express-api-reference';
import { openapiDocument } from '@/docs/openapi';

//------------Route imports-----------------
import authRouter from '@/modules/auth/auth.route';
import usersRouter from '@/modules/users/users.route';
import storesRouter from '@/modules/stores/stores.route';
import shippingRouter from '@/modules/shipping/shipping.route';
import categoriesRouter from '@/modules/categories/categories.route';
import productsRouter from '@/modules/products/products.route';
import cartRouter from '@/modules/cart/cart.route';
import wishlistRouter from '@/modules/wishlist/wishlist.route';
import ordersRouter from '@/modules/orders/orders.route';
import paymentsRouter from '@/modules/payments/payments.route';
import { errorHandler } from '@/shared/middlewares/error.handler';

const app: Application = express();

//-----------Security-----------------------
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL ?? 'http://localhost:3000',
      process.env.SELLER_URL ?? 'http://localhost:3001',
      process.env.ADMIN_URL ?? 'http://localhost:3002',
    ],
    credentials: true,
  }),
);

//------------Rate limiting-----------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

//-------------General middleware-------------
app.use(compression());
app.use(cookieParser());
// Stripe webhook needs the raw body for signature verification — must run
// before the JSON parser (which would otherwise consume/transform the body).
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//------------Health check--------------------
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timeStamp: new Date().toISOString() });
});

//------------API docs------------------------
// Raw spec, Swagger UI (/docs), and Scalar reference (/reference).
// Scalar pulls its bundle from jsDelivr + injects an inline config script, so it
// needs a relaxed CSP (the global helmet default blocks both → blank page).
const docsCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://cdn.jsdelivr.net'],
    workerSrc: ["'self'", 'blob:'],
  },
});

app.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openapiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/reference', docsCsp, apiReference({ content: openapiDocument }));

//------------API routes---------------------
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/stores', storesRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

//------------404 handler--------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

//------------Error handler------------------
app.use(errorHandler);

export default app;
