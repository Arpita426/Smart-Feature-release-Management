import { Router } from 'express';
import { sdkAuthMiddleware } from '../middleware/sdk-auth.middleware';
import { SDKController } from './sdk.controller';

const router = Router();
const sdkController = new SDKController();

router.get('/features', sdkAuthMiddleware, sdkController.getAllFeatures);
router.get('/features/:featureKey', sdkAuthMiddleware, sdkController.getSingleFeature);

export default router;
