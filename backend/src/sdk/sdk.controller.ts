import { NextFunction, Request, Response } from 'express';
import { SDKService } from './sdk.service';

export class SDKController {
  private sdkService = new SDKService();

  getAllFeatures = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.sdkService.getAllFeatures(req.sdkContext!);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSingleFeature = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const featureKey = req.params.featureKey as string;
      const result = await this.sdkService.getSingleFeature(
        req.sdkContext!,
        featureKey
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
