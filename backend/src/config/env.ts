import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535),

  NODE_ENV: z.enum(['development', 'production', 'test']),

  MONGO_URI: z.string().trim().min(1, 'MONGO_URI is required'),

  REDIS_URL: z.string().trim().min(1, 'REDIS_URL is required'),

  JWT_SECRET: z
    .string()
    .trim()
    .min(16, 'JWT_SECRET must be at least 16 characters'),

  JWT_EXPIRES_IN: z
    .string()
    .trim()
    .min(1, 'JWT_EXPIRES_IN is required'),
});

export const env = envSchema.parse(process.env);