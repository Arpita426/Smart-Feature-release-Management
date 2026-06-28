import { z } from 'zod';

export const createFeatureFlagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Feature name must be at least 3 characters')
    .max(100, 'Feature name cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),

  projectId: z
    .string()
    .trim()
    .min(1, 'Project ID is required'),

  rolloutPercentage: z
    .number()
    .min(0, 'Rollout percentage cannot be less than 0')
    .max(100, 'Rollout percentage cannot be greater than 100')
    .optional(),
});

export type CreateFeatureFlagInput = z.infer<
  typeof createFeatureFlagSchema
>;