import { NextFunction, Request, Response } from 'express';
import { ProjectService } from './project.service';
import { createProjectSchema } from './project.validation';

export class ProjectController {
  private projectService = new ProjectService();

  createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = createProjectSchema.parse(req.body);

      const result = await this.projectService.createProject(
        data,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}