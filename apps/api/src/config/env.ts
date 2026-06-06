import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),

  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  SELLER_URL: process.env.SELLER_URL ?? "http://localhost:3001",
  ADMIN_URL: process.env.ADMIN_URL ?? "http://localhost:3002",

  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  MONGO_URI: process.env.MONGO_URI!,
  REDIS_URL: process.env.REDIS_URL!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL!,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY!,
  KHALTI_BASE_URL: process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com/api/v2",

  ESEWA_MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE!,
  ESEWA_SUCCESS_URL: process.env.ESEWA_SUCCESS_URL!,
  ESEWA_FAILURE_URL: process.env.ESEWA_FAILURE_URL!,
  ESEWA_BASE_URL: process.env.ESEWA_BASE_URL ?? "https://rc-epay.esewa.com.np",

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM ?? "noreply@ecommerce.com",
} as const;