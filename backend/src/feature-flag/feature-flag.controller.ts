import { NextFunction, Request, Response } from 'express';
import { FeatureFlagService } from './feature-flag.service';
import { createFeatureFlagSchema } from './feature-flag.validation';
import { updateRolloutSchema } from './feature-flag.validation';
export class FeatureFlagController {
  private featureFlagService = new FeatureFlagService();

  createFeatureFlag = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = createFeatureFlagSchema.parse(req.body);

      const result =
        await this.featureFlagService.createFeatureFlag(
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

  evaluateFeatureFlag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, key, userId } = req.query;

    const result = await this.featureFlagService.evaluateFeatureFlag(
      projectId as string,
      key as string,
      userId as string
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

toggleFeatureFlag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
   const result =
  await this.featureFlagService.toggleFeatureFlag(
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

updateRolloutPercentage = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = updateRolloutSchema.parse(req.body);

    const result =
      await this.featureFlagService.updateRolloutPercentage(
    req.params.id,
    data.rolloutPercentage,
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
getFeatureFlagsByProject = async (
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result =
      await this.featureFlagService.getFeatureFlagsByProject(
        req.params.projectId
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
getFeatureFlagById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result =
      await this.featureFlagService.getFeatureFlagById(
        req.params.id
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