import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

const organizationController = new OrganizationController();

router.post(
  '/',
  authenticate,
  organizationController.createOrganization
);

export default router;