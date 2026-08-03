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

router.get(
  '/',
  authenticate,
  organizationController.listOrganizations
);

router.get(
  '/:id',
  authenticate,
  organizationController.getOrganizationById
);

router.patch(
  '/:id',
  authenticate,
  organizationController.updateOrganization
);

router.get(
  '/:id/members',
  authenticate,
  organizationController.getOrganizationMembers
);

export default router;