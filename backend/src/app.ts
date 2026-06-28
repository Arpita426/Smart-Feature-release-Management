import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import organizationRoutes from './organization/organization.routes';
import projectRoutes from './project/project.routes';
import featureFlagRoutes from './feature-flag/feature-flag.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/feature-flags', featureFlagRoutes);
app.use(errorHandler);


app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Feature Release Management API is running',
  });
});

export default app;