import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { FeatureFlagController } from './feature-flag.controller';

const router = Router();

const featureFlagController = new FeatureFlagController();

router.get(
  '/evaluate',
  authenticate,
  featureFlagController.evaluateFeatureFlag
);
router.get(
  '/project/:projectId',
  authenticate,
  featureFlagController.getFeatureFlagsByProject
);
router.get(
  '/:id',
  authenticate,
  featureFlagController.getFeatureFlagById
);
router.patch(
  '/:id/rollout',
  authenticate,
  featureFlagController.updateRolloutPercentage
);
router.patch(
  '/:id/toggle',
  authenticate,
  featureFlagController.toggleFeatureFlag
);
router.delete(
  '/:id',
  authenticate,
  featureFlagController.deleteFeatureFlag
);
router.post(
  '/',
  authenticate,
  featureFlagController.createFeatureFlag
);

export default router;