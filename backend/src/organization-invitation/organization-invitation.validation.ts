// import { z } from 'zod';

// export const sendInvitationSchema = z.object({
//   body: z.object({
//     email: z.email('Invalid email address'),
//   }),
// });

// export const invitationIdSchema = z.object({
//   params: z.object({
//     invitationId: z.string().min(1),
//   }),
// });

// export const organizationIdSchema = z.object({
//   params: z.object({
//     organizationId: z.string().min(1),
//   }),
// });

// export const acceptInvitationSchema = z.object({
//   body: z.object({
//     token: z.string().trim().min(1, 'Invitation token is required'),
//   }),
// });

import { z } from 'zod';
import { ProjectRole } from '../project-member/project-role';

export const sendInvitationSchema = z.object({
  params: z.object({
    organizationId: z.string().min(1),
  }),
  body: z.object({
    email: z.email('Invalid email address'),
  }),
});

export const sendProjectInvitationSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    email: z.email('Invalid email address'),
    role: z.enum(ProjectRole),
  }),
});

export const sendFeatureInvitationSchema = z.object({
  params: z.object({
    featureId: z.string().min(1),
  }),
  body: z.object({
    email: z.email('Invalid email address'),
    permissions: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one permission is required'),
  }),
});

export const acceptInvitationSchema = z.object({
  body: z.object({
    token: z
      .string()
      .trim()
      .min(1, 'Invitation token is required'),
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

export const projectIdSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const featureIdSchema = z.object({
  params: z.object({
    featureId: z.string().min(1),
  }),
});

export const previewInvitationSchema = z.object({
  query: z.object({
    token: z
      .string()
      .trim()
      .min(1, 'Invitation token is required'),
  }),
});