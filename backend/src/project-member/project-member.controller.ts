import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ProjectMemberService } from './project-member.service';
import { ProjectRole } from './project-role';
import { serializeDoc, serializeDocs } from '../utils/serialize';

export class ProjectMemberController {
  private projectMemberService =
    new ProjectMemberService();

  addMember = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.params.projectId as string;
      const { userId, role } = req.body;

      const member =
        await this.projectMemberService.addMember(
          projectId,
          userId,
          role as ProjectRole,
          req.user!.userId
        );

      res.status(201).json({
        success: true,
        data: serializeDoc(member),
      });
    }
  );

  getProjectMembers = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.params.projectId as string;

      const members =
        await this.projectMemberService.getProjectMembers(
          projectId,
          req.user!.userId
        );

      res.status(200).json({
        success: true,
        data: serializeDocs(members),
      });
    }
  );

  changeRole = asyncHandler(
    async (req: Request, res: Response) => {
      const projectMemberId =
        req.params.projectMemberId as string;

      const { role } = req.body;

      const member =
        await this.projectMemberService.changeRole(
          projectMemberId,
          role as ProjectRole,
          req.user!.userId
        );

      res.status(200).json({
        success: true,
        data: serializeDoc(member),
      });
    }
  );

  removeMember = asyncHandler(
    async (req: Request, res: Response) => {
      const projectMemberId =
        req.params.projectMemberId as string;

      const result =
        await this.projectMemberService.removeMember(
          projectMemberId,
          req.user!.userId
        );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );
}