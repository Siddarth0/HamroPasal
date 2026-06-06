import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

//------------Route imports-----------------

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//------------Health check--------------------
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timeStamp: new Date().toISOString() });
});

//------------API routes---------------------

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
