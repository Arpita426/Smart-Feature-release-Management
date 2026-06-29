import { z } from 'zod';
import { ProjectRole } from './project-role';

export const addProjectMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    userId: z.string().min(1),
    role: z.enum(ProjectRole),
  }),
});

export const updateProjectMemberRoleSchema =
  z.object({
    params: z.object({
      projectMemberId: z.string().min(1),
    }),
    body: z.object({
      role: z.enum(ProjectRole),
    }),
  });

export const projectIdSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const projectMemberIdSchema =
  z.object({
    params: z.object({
      projectMemberId: z.string().min(1),
    }),
  });