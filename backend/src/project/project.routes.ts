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

router.get(
  '/',
  authenticate,
  projectController.listProjects
);

router.get(
  '/:id',
  authenticate,
  projectController.getProjectById
);

router.patch(
  '/:id',
  authenticate,
  projectController.updateProject
);

export default router;