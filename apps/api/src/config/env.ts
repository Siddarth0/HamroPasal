import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

config({ path: path.resolve(__dirname, "../../../../.env") });

// Required vars throw at startup if missing; optional ones (future phases)
// default to "" so the app boots without them configured yet.
const required = z.string().min(1);
const optional = z.string().default("");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),

  CLIENT_URL: z.string().default("http://localhost:3000"),
  SELLER_URL: z.string().default("http://localhost:3001"),
  ADMIN_URL: z.string().default("http://localhost:3002"),

  DATABASE_URL: required,
  DIRECT_URL: optional,
  MONGO_URI: required,
  REDIS_URL: required,

  JWT_ACCESS_SECRET: required,
  JWT_REFRESH_SECRET: required,
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:4000/api/auth/google/callback"),

  CLOUDINARY_CLOUD_NAME: optional,
  CLOUDINARY_API_KEY: optional,
  CLOUDINARY_API_SECRET: optional,

  KHALTI_SECRET_KEY: optional,
  KHALTI_BASE_URL: z.string().default("https://dev.khalti.com/api/v2"),

  ESEWA_MERCHANT_CODE: optional,
  ESEWA_SUCCESS_URL: optional,
  ESEWA_FAILURE_URL: optional,
  ESEWA_BASE_URL: z.string().default("https://rc-epay.esewa.com.np"),

  STRIPE_SECRET_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,

  RESEND_API_KEY: optional,
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  EMAIL_FROM: z.string().default("noreply@ecommerce.com"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.error(`❌ Invalid environment variables:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
