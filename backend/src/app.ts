import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import organizationRoutes from './organization/organization.routes';
import organizationInvitationRoutes from './organization-invitation/organization-invitation.routes';
import projectRoutes from './project/project.routes';
import projectMemberRoutes from './project-member/project-member.routes';
import featureFlagRoutes from './feature-flag/feature-flag.routes';
import auditRoutes from './audit/audit.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Feature Release Management API is running',
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/organization-invitations', organizationInvitationRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/project-members', projectMemberRoutes);
app.use('/api/v1/feature-flags', featureFlagRoutes);
app.use('/api/v1/audits', auditRoutes);

app.use(errorHandler);

export default app;