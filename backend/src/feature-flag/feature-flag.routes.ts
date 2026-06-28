import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { FeatureFlagController } from './feature-flag.controller';

const router = Router();

const featureFlagController = new FeatureFlagController();

router.post(
  '/',
  authenticate,
  featureFlagController.createFeatureFlag
);

export default router;