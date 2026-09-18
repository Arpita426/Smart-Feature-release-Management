import { Request, Response } from 'express';
import { OrganizationInvitationService } from './organization-invitation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { serializeDoc, serializeDocs } from '../utils/serialize';

// import { acceptInvitationSchema } from './organization-invitation.validation';

import {
  acceptInvitationSchema,
  sendFeatureInvitationSchema,
  sendInvitationSchema,
  sendProjectInvitationSchema,
  previewInvitationSchema,
} from './organization-invitation.validation';


export class OrganizationInvitationController {
  private organizationInvitationService =
    new OrganizationInvitationService();
sendInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      sendInvitationSchema.parse({
        params: req.params,
        body: req.body,
      });

    const organizationId =
      data.params.organizationId;

    const email =
      data.body.email;

    const invitation =
      await this.organizationInvitationService.sendInvitation(
        organizationId,
        email,
        req.user!.userId
      );

    res.status(201).json({
      success: true,
      data: this.sanitizeInvitation(invitation),
    });
  }
);

previewInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      previewInvitationSchema.parse({
        query: req.query,
      });

    const invitation =
      await this.organizationInvitationService.previewInvitation(
        data.query.token,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: invitation,
    });
  }
);

acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
     const data =
      acceptInvitationSchema.parse({
        body: req.body,
      });

    const { token } = data.body;

    const invitation =
      await this.organizationInvitationService.acceptInvitation(
        token,
        req.user!.userId
      );

    res.status(200).json({
      success: true,
      data: this.sanitizeInvitation(invitation),
    });
  }
);

sendProjectInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      sendProjectInvitationSchema.parse({
        params: req.params,
        body: req.body,
      });

    const invitation =
      await this.organizationInvitationService.sendProjectInvitation(
        data.params.projectId,
        data.body.email,
        data.body.role,
        req.user!.userId
      );

    res.status(201).json({
      success: true,
      data: this.sanitizeInvitation(invitation),
    });
  }
);

sendFeatureInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const data =
      sendFeatureInvitationSchema.parse({
        params: req.params,
        body: req.body,
      });

    const invitation =
      await this.organizationInvitationService.sendFeatureInvitation(
        data.params.featureId,
        data.body.email,
        data.body.permissions,
        req.user!.userId
      );

    res.status(201).json({
      success: true,
      data: this.sanitizeInvitation(invitation),
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
      data: this.sanitizeInvitation(invitation),
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
      data: this.sanitizeInvitation(invitation),
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
private sanitizeInvitation(invitation: any) {
  const serialized = serializeDoc(invitation);

  if (serialized && typeof serialized === 'object') {
    const result = { ...serialized };
    delete result.tokenHash;
    return result;
  }

  return serialized;
}
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