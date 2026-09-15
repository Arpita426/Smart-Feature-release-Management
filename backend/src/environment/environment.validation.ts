import { z } from 'zod';

const environmentColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'] as const;

export const createEnvironmentSchema = z.object({
  name: z.string().trim().min(2, 'Environment name must be at least 2 characters').max(100, 'Environment name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  color: z.enum(environmentColors).optional(),
});

export const updateEnvironmentSchema = z.object({
  name: z.string().trim().min(2, 'Environment name must be at least 2 characters').max(100, 'Environment name cannot exceed 100 characters').optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  color: z.enum(environmentColors).optional(),
});

export const reorderEnvironmentsSchema = z.object({
  environmentIds: z.array(z.string().trim().min(1)).min(1),
});

export const createFeatureConfigurationSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0, 'Rollout percentage cannot be less than 0').max(100, 'Rollout percentage cannot be greater than 100').optional(),
  killSwitch: z.boolean().optional(),
  targetingRules: z.record(z.string(), z.any()).optional(),
  variables: z.record(z.string(), z.any()).optional(),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;
export type ReorderEnvironmentsInput = z.infer<typeof reorderEnvironmentsSchema>;
export type CreateFeatureConfigurationInput = z.infer<typeof createFeatureConfigurationSchema>;
