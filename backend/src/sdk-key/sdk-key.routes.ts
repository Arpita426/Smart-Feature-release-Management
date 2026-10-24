import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { SDKKeyController } from './sdk-key.controller';

const router = Router();
const sdkKeyController = new SDKKeyController();

router.get(
  '/projects/:projectId/environments/:environmentId/sdk-keys',
  authenticate,
  sdkKeyController.listKeys
);
router.post(
  '/projects/:projectId/environments/:environmentId/sdk-keys',
  authenticate,
  sdkKeyController.createKey
);
router.delete(
  '/projects/:projectId/environments/:environmentId/sdk-keys/:keyId',
  authenticate,
  sdkKeyController.revokeKey
);
router.post(
  '/projects/:projectId/environments/:environmentId/sdk-keys/:keyId/regenerate',
  authenticate,
  sdkKeyController.regenerateKey
);

export default router;
