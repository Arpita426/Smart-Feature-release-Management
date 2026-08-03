import { NextFunction, Request, Response } from 'express';
import { OrganizationService } from './organization.service';
import { createOrganizationSchema } from './organization.validation';

export class OrganizationController {
  private organizationService = new OrganizationService();

  createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = createOrganizationSchema.parse(req.body);

      const result = await this.organizationService.createOrganization(
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

  listOrganizations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.organizationService.listOrganizations(
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

  getOrganizationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.organizationService.getOrganizationById(
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

  updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.organizationService.updateOrganization(
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

  getOrganizationMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.organizationService.getOrganizationMembers(
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
}