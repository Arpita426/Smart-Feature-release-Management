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

  listProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const organizationId = req.query.organizationId as string | undefined;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'organizationId query parameter is required',
        });
        return;
      }

      const result = await this.projectService.listProjectsByOrganization(
        organizationId,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.projectService.getProjectById(
        req.params.id as string,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.projectService.updateProject(
        req.params.id as string,
        req.body,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}