import { Request, Response } from 'express';
import { OrganizationInvitationService } from './organization-invitation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { serializeDoc, serializeDocs } from '../utils/serialize';

export class OrganizationInvitationController {
  private organizationInvitationService =
    new OrganizationInvitationService();
sendInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId as string;
    const { email } = req.body;

    const invitation =
      await this.organizationInvitationService.sendInvitation(
        organizationId,
        email,
        req.user!.userId
      );

    res.status(201).json({
      success: true,
      data: serializeDoc(invitation),
    });
  }
);
acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const invitationId = req.params.invitationId as string;

    const invitation =
      await this.organizationInvitationService.acceptInvitation(
        invitationId,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: serializeDoc(invitation),
    });
  }
);
rejectInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const invitationId = req.params.invitationId as string;

    const invitation =
      await this.organizationInvitationService.rejectInvitation(
        invitationId,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: serializeDoc(invitation),
    });
  }
);
cancelInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const invitationId = req.params.invitationId as string;

    const invitation =
      await this.organizationInvitationService.cancelInvitation(
        invitationId,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: serializeDoc(invitation),
    });
  }
);
getOrganizationInvitations = asyncHandler(
  async (req: Request, res: Response) => {
    const organizationId = req.params.organizationId as string;

    const invitations =
      await this.organizationInvitationService.getOrganizationInvitations(
        organizationId
      );

    res.status(200).json({
      success: true,
      data: serializeDocs(invitations),
    });
  }
);
getMyInvitations = asyncHandler(
  async (_req: Request, res: Response) => {
    const invitations =
      await this.organizationInvitationService.getMyInvitations(
        _req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: serializeDocs(invitations),
    });
  }
);
}