import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535),

  NODE_ENV: z.enum(['development', 'production', 'test']),

  MONGO_URI: z
    .string()
    .trim()
    .min(1, 'MONGO_URI is required'),

  REDIS_URL: z
    .string()
    .trim()
    .min(1, 'REDIS_URL is required'),

  JWT_SECRET: z
    .string()
    .trim()
    .min(
      16,
      'JWT_SECRET must be at least 16 characters'
    ),

  JWT_EXPIRES_IN: z
    .string()
    .trim()
    .min(
      1,
      'JWT_EXPIRES_IN is required'
    ),

  EMAIL_HOST: z
    .string()
    .trim()
    .min(1, 'EMAIL_HOST is required'),

  EMAIL_PORT: z.coerce
    .number()
    .min(1)
    .max(65535),

  EMAIL_USER: z
    .string()
    .trim()
    .email('EMAIL_USER must be a valid email'),

  EMAIL_PASSWORD: z
    .string()
    .trim()
    .min(
      1,
      'EMAIL_PASSWORD is required'
    ),

  EMAIL_FROM: z
    .string()
    .trim()
    .email('EMAIL_FROM must be a valid email'),

    FRONTEND_URL: z
  .string()
  .trim()
  .url('FRONTEND_URL must be a valid URL'),
});

export const env = envSchema.parse(process.env);