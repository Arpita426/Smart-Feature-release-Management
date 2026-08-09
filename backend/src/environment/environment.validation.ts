import { z } from 'zod';

export const createEnvironmentSchema = z.object({
  name: z.string().trim().min(2, 'Environment name must be at least 2 characters').max(100, 'Environment name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  color: z.string().trim().max(30, 'Color cannot exceed 30 characters').optional(),
  order: z.number().int().min(0).max(1000).optional(),
  isDefault: z.boolean().optional(),
});

export const updateEnvironmentSchema = z.object({
  name: z.string().trim().min(2, 'Environment name must be at least 2 characters').max(100, 'Environment name cannot exceed 100 characters').optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  color: z.string().trim().max(30, 'Color cannot exceed 30 characters').optional(),
  order: z.number().int().min(0).max(1000).optional(),
  isDefault: z.boolean().optional(),
});

export const createFeatureConfigurationSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0, 'Rollout percentage cannot be less than 0').max(100, 'Rollout percentage cannot be greater than 100').optional(),
  killSwitch: z.boolean().optional(),
  targetingRules: z.record(z.any()).optional(),
  variables: z.record(z.any()).optional(),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;
export type CreateFeatureConfigurationInput = z.infer<typeof createFeatureConfigurationSchema>;
