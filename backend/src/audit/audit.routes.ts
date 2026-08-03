import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();
const controller = new AuditController();

router.get(
  '/projects/:projectId',
  authenticate,
  controller.getProjectAuditLogs
);

export default router;
