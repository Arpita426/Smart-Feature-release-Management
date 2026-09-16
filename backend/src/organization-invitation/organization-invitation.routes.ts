import { Router } from 'express';
import { OrganizationInvitationController } from './organization-invitation.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
// import { validate } from '../middleware/validate';
import {
  sendFeatureInvitationSchema,
  sendInvitationSchema,
  sendProjectInvitationSchema,
} from './organization-invitation.validation';

const router = Router();
const controller = new OrganizationInvitationController();

// Admin
router.post(
  '/organizations/:organizationId/invitations',
  authenticate,
  authorize,
  controller.sendInvitation
);

router.get(
  '/organizations/:organizationId/invitations',
  authenticate,
  authorize,
  controller.getOrganizationInvitations
);

router.patch(
  '/organizations/:organizationId/invitations/:invitationId/cancel',
  authenticate,
  authorize,
  controller.cancelInvitation
);

router.post(
  '/projects/:projectId/invitations',
  authenticate,
  authorize,
  controller.sendProjectInvitation
);

router.post(
  '/features/:featureId/invitations',
  authenticate,
  authorize,
  controller.sendFeatureInvitation
);

// User
router.get(
  '/users/me/invitations',
  authenticate,
  controller.getMyInvitations
);

router.post(
  '/users/me/invitations/accept',
  authenticate,
  controller.acceptInvitation
);

router.patch(
  '/users/me/invitations/:invitationId/reject',
  authenticate,
  controller.rejectInvitation
);

router.get(
  '/users/me/invitations/preview',
  authenticate,
  controller.previewInvitation
);

export default router;