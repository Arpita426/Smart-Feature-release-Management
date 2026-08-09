import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { EnvironmentController } from './environment.controller';

const router = Router();
const environmentController = new EnvironmentController();

router.get('/projects/:projectId/environments', authenticate, environmentController.listEnvironments);
router.post('/projects/:projectId/environments', authenticate, environmentController.createEnvironment);
router.get('/environments/:environmentId', authenticate, environmentController.getEnvironmentById);
router.patch('/environments/:environmentId', authenticate, environmentController.updateEnvironment);
router.delete('/environments/:environmentId', authenticate, environmentController.deleteEnvironment);
router.get('/feature-flags/:featureFlagId/configurations', authenticate, environmentController.listFeatureConfigurations);
router.get('/feature-flags/:featureFlagId/configurations/:environmentId', authenticate, environmentController.getFeatureConfiguration);
router.patch('/feature-flags/:featureFlagId/configurations/:environmentId', authenticate, environmentController.upsertFeatureConfiguration);

export default router;
