import { NextFunction, Request, Response } from 'express';
import { SDKKeyService } from './sdk-key.service';
import { createSDKKeySchema } from './sdk-key.validation';

export class SDKKeyController {
  private sdkKeyService = new SDKKeyService();

  listKeys = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId, environmentId } = req.params;
      const keys = await this.sdkKeyService.listSDKKeys(
        projectId as string,
        environmentId as string,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: keys,
      });
    } catch (error) {
      next(error);
    }
  };

  createKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId, environmentId } = req.params;
      const data = createSDKKeySchema.parse(req.body);

      const result = await this.sdkKeyService.createSDKKey(
        projectId as string,
        environmentId as string,
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

  revokeKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId, environmentId, keyId } = req.params;

      const result = await this.sdkKeyService.revokeSDKKey(
        projectId as string,
        environmentId as string,
        keyId as string,
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

  regenerateKey = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { projectId, environmentId, keyId } = req.params;

      const result = await this.sdkKeyService.regenerateSDKKey(
        projectId as string,
        environmentId as string,
        keyId as string,
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
