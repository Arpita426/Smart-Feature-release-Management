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
}