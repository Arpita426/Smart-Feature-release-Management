import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate } from '../middleware/authenticate.middleware';

const router = Router();

const projectController = new ProjectController();

router.post(
  '/',
  authenticate,
  projectController.createProject
);

export default router;