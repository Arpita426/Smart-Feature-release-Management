import { z } from 'zod';

export const createSDKKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'SDK Key name must be at least 2 characters')
    .max(100, 'SDK Key name cannot exceed 100 characters'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type CreateSDKKeyInput = z.infer<typeof createSDKKeySchema>;
