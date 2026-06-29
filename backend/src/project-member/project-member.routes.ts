import { Router } from 'express';

import { authenticate } from '../middleware/authenticate';
import { ProjectMemberController } from './project-member.controller';

const router = Router();

const controller =
  new ProjectMemberController();

router.post(
  '/projects/:projectId/members',
  authenticate,
  controller.addMember
);

router.get(
  '/projects/:projectId/members',
  authenticate,
  controller.getProjectMembers
);

router.patch(
  '/project-members/:projectMemberId',
  authenticate,
  controller.changeRole
);

router.delete(
  '/project-members/:projectMemberId',
  authenticate,
  controller.removeMember
);

export default router;