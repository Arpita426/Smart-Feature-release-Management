import { z } from 'zod';

export const sendInvitationSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
  }),
});

export const invitationIdSchema = z.object({
  params: z.object({
    invitationId: z.string().min(1),
  }),
});

export const organizationIdSchema = z.object({
  params: z.object({
    organizationId: z.string().min(1),
  }),
});