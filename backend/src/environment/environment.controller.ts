import { NextFunction, Request, Response } from 'express';
import { EnvironmentService } from './environment.service';
import { createEnvironmentSchema, createFeatureConfigurationSchema, reorderEnvironmentsSchema, updateEnvironmentSchema } from './environment.validation';

export class EnvironmentController {
  private environmentService = new EnvironmentService();

  listEnvironments = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.environmentService.listEnvironmentsByProject(req.params.projectId, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  createEnvironment = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createEnvironmentSchema.parse(req.body);
      const result = await this.environmentService.createEnvironment(req.params.projectId, data, req.user!.userId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getEnvironmentById = async (req: Request<{ environmentId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.environmentService.getEnvironmentById(req.params.environmentId, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  updateEnvironment = async (req: Request<{ environmentId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = updateEnvironmentSchema.parse(req.body);
      const result = await this.environmentService.updateEnvironment(req.params.environmentId, data, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  deleteEnvironment = async (req: Request<{ environmentId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.environmentService.deleteEnvironment(req.params.environmentId, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  reorderEnvironments = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = reorderEnvironmentsSchema.parse(req.body);
      const result = await this.environmentService.reorderEnvironments(req.params.projectId, data, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listFeatureConfigurations = async (req: Request<{ featureFlagId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.environmentService.listConfigurationsByFeature(req.params.featureFlagId, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getFeatureConfiguration = async (req: Request<{ featureFlagId: string; environmentId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.environmentService.getConfigurationByEnvironment(req.params.featureFlagId, req.params.environmentId, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  upsertFeatureConfiguration = async (req: Request<{ featureFlagId: string; environmentId: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createFeatureConfigurationSchema.parse(req.body);
      const result = await this.environmentService.upsertConfiguration(req.params.featureFlagId, req.params.environmentId, data, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
