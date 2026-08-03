import { NextFunction, Request, Response } from 'express';
import { AuditService } from './audit.service';

export class AuditController {
  private auditService = new AuditService();

  getProjectAuditLogs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.auditService.getProjectAuditLogs(
        req.params.projectId as string,
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
