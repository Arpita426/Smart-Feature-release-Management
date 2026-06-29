import { Router } from 'express';
import { OrganizationInvitationController } from './organization-invitation.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
// import { validate } from '../middleware/validate';

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

// User
router.get(
  '/users/me/invitations',
  authenticate,
  controller.getMyInvitations
);

router.patch(
  '/users/me/invitations/:invitationId/accept',
  authenticate,
  controller.acceptInvitation
);

router.patch(
  '/users/me/invitations/:invitationId/reject',
  authenticate,
  controller.rejectInvitation
);

export default router;