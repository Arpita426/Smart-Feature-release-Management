import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),

  organizationId: z
    .string()
    .trim()
    .min(1, 'Organization ID is required'),
});

export type CreateProjectInput = z.infer<
  typeof createProjectSchema
>;