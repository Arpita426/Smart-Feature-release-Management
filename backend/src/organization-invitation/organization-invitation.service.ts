import { Types } from 'mongoose';

import { OrganizationInvitationRepository } from './organization-invitation.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { UserRepository } from '../user/user.repository';

import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';

import { OrganizationRole } from '../organization-member/organization-role';

import { AuditRepository } from '../audit/audit.repository';
import { AuditAction } from '../audit/audit-action';
import { AuditEntity } from '../audit/audit-entity';
import { OrganizationInvitationStatus } from './organization-invitation-status';
import { InvitationScope } from './invitation-scope';
import { IOrganizationInvitation } from './organization-invitation.model';
import { EmailService } from '../notification/email.service';
import {
  generateInvitationToken,
  hashInvitationToken,
} from './invitation-token';


import { ProjectMemberRepository } from '../project-member/project-member.repository';
import { ProjectRepository } from '../project/project.repository';
import { FeatureFlagRepository } from '../feature-flag/feature-flag.repository';
import { FeatureAccessRepository } from '../feature-access/feature-access.repository';
import { ProjectRole } from '../project-member/project-role';


export class OrganizationInvitationService {
    private organizationInvitationRepository =
  new OrganizationInvitationRepository();

private organizationRepository =
  new OrganizationRepository();

private organizationMemberRepository =
  new OrganizationMemberRepository();

private userRepository =
  new UserRepository();

  private projectRepository =
  new ProjectRepository();

private projectMemberRepository =
  new ProjectMemberRepository();

private featureFlagRepository =
  new FeatureFlagRepository();

private featureAccessRepository =
  new FeatureAccessRepository();

private emailService =
  new EmailService();

  private auditRepository =
  new AuditRepository();
  private async getPendingInvitationById(
  invitationId: string
) {
  const invitation =
    await this.organizationInvitationRepository.findById(
      invitationId
    );

  if (!invitation) {
    throw new NotFoundError(
      'Invitation not found.'
    );
  }

  if (
    invitation.status !==
    OrganizationInvitationStatus.PENDING
  ) {
    throw new ConflictError(
      'This invitation has already been processed.'
    );
  }

  if (invitation.expiresAt <= new Date()) {
    throw new ConflictError(
      'This invitation has expired.'
    );
  }

  return invitation;
}

async previewInvitation(
  invitationToken: string,
  userId: string
) {
  const invitation =
    await this.getPendingInvitationByToken(
      invitationToken
    );

  await this.getInvitationUser(
    invitation,
    userId
  );

  const inviter =
    await this.userRepository.findById(
      invitation.invitedBy.toString()
    );

  let targetName = '';

  if (
    invitation.scope ===
    InvitationScope.ORGANIZATION
  ) {
    const organization =
      await this.organizationRepository.findById(
        invitation.targetId.toString()
      );

    if (!organization) {
      throw new NotFoundError(
        'The invited organization no longer exists.'
      );
    }

    targetName = organization.name;
  }

  if (
    invitation.scope ===
    InvitationScope.PROJECT
  ) {
    const project =
      await this.projectRepository.findById(
        invitation.targetId.toString()
      );

    if (!project) {
      throw new NotFoundError(
        'The invited project no longer exists.'
      );
    }

    if (
      project.organizationId.toString() !==
      invitation.organizationId.toString()
    ) {
      throw new ConflictError(
        'Invitation does not belong to this organization.'
      );
    }

    targetName = project.name;
  }

  if (
    invitation.scope ===
    InvitationScope.FEATURE
  ) {
    const feature =
      await this.featureFlagRepository.findById(
        invitation.targetId.toString()
      );

    if (!feature) {
      throw new NotFoundError(
        'The invited feature no longer exists.'
      );
    }

    const project =
      await this.projectRepository.findById(
        feature.projectId.toString()
      );

    if (!project) {
      throw new NotFoundError(
        'The feature project no longer exists.'
      );
    }

    if (
      project.organizationId.toString() !==
      invitation.organizationId.toString()
    ) {
      throw new ConflictError(
        'Invitation does not belong to this organization.'
      );
    }

    targetName = feature.name;
  }

  return {
    _id: invitation._id,
    organizationId:
      invitation.organizationId,
    scope: invitation.scope,
    targetId: invitation.targetId,
    targetName,
    email: invitation.email,
    inviteeId: invitation.inviteeId,
    role: invitation.role,
    permissions:
      invitation.permissions ?? [],
    status: invitation.status,
    expiresAt:
      invitation.expiresAt,
    invitedBy: inviter
      ? {
          _id: inviter._id,
          fullName:
            inviter.fullName,
          email: inviter.email,
        }
      : invitation.invitedBy,
    createdAt:
      invitation.createdAt,
    updatedAt:
      invitation.updatedAt,
  };
}

private async getPendingInvitationByToken(
  invitationToken: string
) {
  const tokenHash =
    hashInvitationToken(invitationToken);

  const invitation =
    await this.organizationInvitationRepository.findByTokenHash(
      tokenHash
    );

  if (!invitation) {
    throw new NotFoundError(
      'Invalid invitation token.'
    );
  }

  if (
    invitation.status !==
    OrganizationInvitationStatus.PENDING
  ) {
    throw new ConflictError(
      'This invitation has already been processed.'
    );
  }

  if (invitation.expiresAt <= new Date()) {
    throw new ConflictError(
      'This invitation has expired.'
    );
  }

  return invitation;
}


private async getInvitationUser(
  invitation: IOrganizationInvitation,
  userId: string
) {
  const user =
    await this.userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError(
      'User not found.'
    );
  }

  if (
    user.email.toLowerCase() !==
    invitation.email.toLowerCase()
  ) {
    throw new UnauthorizedError(
      'You are not allowed to respond to this invitation.'
    );
  }

  return user;
}
  async sendInvitation(
  organizationId: string,
  email: string,
  invitedBy: string
) {
    email = email.trim().toLowerCase();
    const organization =
  await this.organizationRepository.findById(
    organizationId
  );

if (!organization) {
  throw new NotFoundError(
    'Organization not found.'
  );
}
const inviter =
  await this.organizationMemberRepository.findMember(
    organizationId,
    invitedBy
  );

if (!inviter) {
  throw new UnauthorizedError(
    'You are not a member of this organization.'
  );
}

if (
  inviter.role !== OrganizationRole.OWNER &&
  inviter.role !== OrganizationRole.ADMIN
) {
  throw new UnauthorizedError(
    'You are not allowed to invite members.'
  );
}
const user = await this.userRepository.findByEmail(
  email
);

if (user) {
  const member =
    await this.organizationMemberRepository.findMember(
      organizationId,
      user._id.toString()
    );

  if (member) {
    throw new ConflictError(
      'User is already a member of this organization.'
    );
  }
}
const pendingInvitation =
  await this.organizationInvitationRepository.findPendingInvitation(
    organizationId,
    InvitationScope.ORGANIZATION,
    organizationId,
    email
  );

if (pendingInvitation) {
  throw new ConflictError(
    'A pending invitation already exists for this email.'
  );
}
const rawToken = generateInvitationToken();

const tokenHash = hashInvitationToken(rawToken);

const expiresAt = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000
);

const invitation =
  await this.organizationInvitationRepository.create({
    organizationId: organization._id,
    scope: InvitationScope.ORGANIZATION,
    targetId: organization._id,
    email: email.toLowerCase(),
    inviteeId: user?._id,
    invitedBy: inviter.userId,
    tokenHash,
    expiresAt,
  });
  // TODO: Send invitation email

  await this.emailService.sendOrganizationInvitation(
  email,
  organization.name,
  rawToken
);

await this.auditRepository.create(
  new Types.ObjectId(invitedBy),
  AuditAction.SEND_ORGANIZATION_INVITATION,
  AuditEntity.ORGANIZATION,
  organization._id
);

// TODO: Replace with EmailService in Version 2
console.log(
  `Invitation email sent to ${email}`
);

return invitation;
}

async sendProjectInvitation(
  projectId: string,
  email: string,
  role: ProjectRole,
  invitedBy: string
) {
  email = email.trim().toLowerCase();

  const project =
    await this.projectRepository.findById(projectId);

  if (!project) {
    throw new NotFoundError(
      'Project not found.'
    );
  }

  const organizationId =
    project.organizationId.toString();

  const inviter =
    await this.organizationMemberRepository.findMember(
      organizationId,
      invitedBy
    );

  if (!inviter) {
    throw new UnauthorizedError(
      'You are not a member of this organization.'
    );
  }

  if (
    inviter.role !== OrganizationRole.OWNER &&
    inviter.role !== OrganizationRole.ADMIN
  ) {
    throw new UnauthorizedError(
      'You are not allowed to invite project members.'
    );
  }

  const user =
    await this.userRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError(
      'No registered user exists with this email.'
    );
  }

  const organizationMember =
    await this.organizationMemberRepository.findMember(
      organizationId,
      user._id.toString()
    );

  if (!organizationMember) {
    throw new ConflictError(
      'User must be a member of the organization before being invited to a project.'
    );
  }

  const existingProjectMember =
    await this.projectMemberRepository.findMember(
      projectId,
      user._id.toString()
    );

  if (existingProjectMember) {
    throw new ConflictError(
      'User is already a member of this project.'
    );
  }

  const pendingInvitation =
    await this.organizationInvitationRepository.findPendingInvitation(
      organizationId,
      InvitationScope.PROJECT,
      project._id.toString(),
      email
    );

  if (pendingInvitation) {
    throw new ConflictError(
      'A pending project invitation already exists for this email.'
    );
  }

  const rawToken =
    generateInvitationToken();

  const tokenHash =
    hashInvitationToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000
  );

  const invitation =
    await this.organizationInvitationRepository.create({
      organizationId: project.organizationId,
      scope: InvitationScope.PROJECT,
      targetId: project._id,
      email,
      inviteeId: user._id,
      role,
      invitedBy: inviter.userId,
      tokenHash,
      expiresAt,
    });
await this.emailService.sendProjectInvitation(
  email,
  project.name,
  rawToken
);
  console.log(
    `Project invitation email sent to ${email}`
  );

  return invitation;
}

async sendFeatureInvitation(
  featureId: string,
  email: string,
  permissions: string[],
  invitedBy: string
) {
  email = email.trim().toLowerCase();

  const feature =
    await this.featureFlagRepository.findById(
      featureId
    );

  if (!feature) {
    throw new NotFoundError(
      'Feature not found.'
    );
  }

  const project =
    await this.projectRepository.findById(
      feature.projectId.toString()
    );

  if (!project) {
    throw new NotFoundError(
      'Project not found.'
    );
  }

  const organizationId =
    project.organizationId.toString();

  const inviter =
    await this.organizationMemberRepository.findMember(
      organizationId,
      invitedBy
    );

  if (!inviter) {
    throw new UnauthorizedError(
      'You are not a member of this organization.'
    );
  }

  if (
    inviter.role !== OrganizationRole.OWNER &&
    inviter.role !== OrganizationRole.ADMIN
  ) {
    throw new UnauthorizedError(
      'You are not allowed to invite feature users.'
    );
  }

  const user =
    await this.userRepository.findByEmail(email);

  if (!user) {
    throw new NotFoundError(
      'No registered user exists with this email.'
    );
  }

  const projectMember =
    await this.projectMemberRepository.findMember(
      project._id.toString(),
      user._id.toString()
    );

  if (!projectMember) {
    throw new ConflictError(
      'User must be a member of the project before receiving feature access.'
    );
  }

  if (!permissions.length) {
    throw new ConflictError(
      'At least one feature permission is required.'
    );
  }

  const existingAccess =
    await this.featureAccessRepository.findByFeatureAndUser(
      feature._id.toString(),
      user._id.toString()
    );

  if (existingAccess) {
    throw new ConflictError(
      'User already has access to this feature.'
    );
  }

  const pendingInvitation =
    await this.organizationInvitationRepository.findPendingInvitation(
      organizationId,
      InvitationScope.FEATURE,
      feature._id.toString(),
      email
    );

  if (pendingInvitation) {
    throw new ConflictError(
      'A pending feature invitation already exists for this email.'
    );
  }

  const rawToken =
    generateInvitationToken();

  const tokenHash =
    hashInvitationToken(rawToken);

  const expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000
  );

  const invitation =
    await this.organizationInvitationRepository.create({
      organizationId: project.organizationId,
      scope: InvitationScope.FEATURE,
      targetId: feature._id,
      email,
      inviteeId: user._id,
      permissions,
      invitedBy: inviter.userId,
      tokenHash,
      expiresAt,
    });
    await this.emailService.sendFeatureInvitation(
  email,
  feature.name,
  rawToken
);
  console.log(
    `Feature invitation email sent to ${email}`
  );

  return invitation;
}


async acceptInvitation(
  invitationToken: string,
  userId: string
) {
  const invitation =
    await this.getPendingInvitationByToken(
      invitationToken
    );

  const user =
    await this.getInvitationUser(
      invitation,
      userId
    );

  switch (invitation.scope) {
    case InvitationScope.ORGANIZATION: {
      const existingMember =
        await this.organizationMemberRepository.findMember(
          invitation.organizationId.toString(),
          userId
        );

      if (existingMember) {
        throw new ConflictError(
          'You are already a member of this organization.'
        );
      }

      await this.organizationMemberRepository.create(
        invitation.organizationId,
        user._id,
        OrganizationRole.MEMBER
      );

      await this.auditRepository.create(
        user._id,
        AuditAction.ACCEPT_ORGANIZATION_INVITATION,
        AuditEntity.ORGANIZATION,
        invitation.organizationId
      );

      break;
    }

    case InvitationScope.PROJECT: {
      const project =
        await this.projectRepository.findById(
          invitation.targetId.toString()
        );

      if (!project) {
        throw new NotFoundError(
          'The invited project no longer exists.'
        );
      }

      if (
        project.organizationId.toString() !==
        invitation.organizationId.toString()
      ) {
        throw new ConflictError(
          'Invitation does not belong to this project organization.'
        );
      }

      const organizationMember =
        await this.organizationMemberRepository.findMember(
          project.organizationId.toString(),
          userId
        );

      if (!organizationMember) {
        throw new ConflictError(
          'You must be a member of the organization before joining this project.'
        );
      }

      const existingProjectMember =
        await this.projectMemberRepository.findMember(
          project._id.toString(),
          userId
        );

      if (existingProjectMember) {
        throw new ConflictError(
          'You are already a member of this project.'
        );
      }

      const role =
        invitation.role as ProjectRole;

      if (
        !Object.values(ProjectRole).includes(role)
      ) {
        throw new ConflictError(
          'Invalid project role in invitation.'
        );
      }

      await this.projectMemberRepository.create({
        organizationId:
          project.organizationId,
        projectId: project._id,
        userId: user._id,
        role,
        addedBy: invitation.invitedBy,
      });

      await this.auditRepository.create(
        user._id,
        AuditAction.ADD_PROJECT_MEMBER,
        AuditEntity.PROJECT,
        project._id
      );

      break;
    }

    case InvitationScope.FEATURE: {
      const feature =
        await this.featureFlagRepository.findById(
          invitation.targetId.toString()
        );

      if (!feature) {
        throw new NotFoundError(
          'The invited feature no longer exists.'
        );
      }

      const project =
        await this.projectRepository.findById(
          feature.projectId.toString()
        );

      if (!project) {
        throw new NotFoundError(
          'The feature project no longer exists.'
        );
      }

      if (
        project.organizationId.toString() !==
        invitation.organizationId.toString()
      ) {
        throw new ConflictError(
          'Invitation does not belong to this project organization.'
        );
      }

      const projectMember =
        await this.projectMemberRepository.findMember(
          project._id.toString(),
          userId
        );

      if (!projectMember) {
        throw new ConflictError(
          'You must be a member of the project before receiving feature access.'
        );
      }

      const existingAccess =
        await this.featureAccessRepository.findByFeatureAndUser(
          feature._id.toString(),
          userId
        );

      if (existingAccess) {
        throw new ConflictError(
          'You already have access to this feature.'
        );
      }

      const permissions =
        invitation.permissions ?? [];

      if (permissions.length === 0) {
        throw new ConflictError(
          'Invitation does not contain any feature permissions.'
        );
      }

      await this.featureAccessRepository.create({
        featureId: feature._id,
        projectId: project._id,
        userId: user._id,
        permissions,
      });

      break;
    }

    default:
      throw new ConflictError(
        'Unsupported invitation scope.'
      );
  }

  await this.organizationInvitationRepository.update(
  invitation._id.toString(),
  {
    status:
      OrganizationInvitationStatus.ACCEPTED,
    acceptedAt: new Date(),
    respondedAt: new Date(),
  }
);

  return await this.organizationInvitationRepository.findById(
  invitation._id.toString()
);
}


async rejectInvitation(
  invitationId: string,
  userId: string
) {
  const invitation =
    await this.getPendingInvitationById(
      invitationId
    );

  const user =
    await this.getInvitationUser(
      invitation,
      userId
    );

  await this.organizationInvitationRepository.update(
    invitationId,
    {
      status:
        OrganizationInvitationStatus.REJECTED,
      respondedAt: new Date(),
    }
  );

  await this.auditRepository.create(
    user._id,
    AuditAction.REJECT_ORGANIZATION_INVITATION,
    AuditEntity.ORGANIZATION,
    invitation.organizationId
  );

  return await this.organizationInvitationRepository.findById(
    invitationId
);
}
async cancelInvitation(
  invitationId: string,
  cancelledBy: string
) {
  const invitation =
    await this.getPendingInvitationById(
      invitationId
    );

  const member =
  await this.organizationMemberRepository.findMember(
    invitation.organizationId.toString(),
    cancelledBy
  );

  if (!member) {
    throw new UnauthorizedError(
      'You are not a member of this organization.'
    );
  }

  if (
    member.role !== OrganizationRole.OWNER &&
    member.role !== OrganizationRole.ADMIN
  ) {
    throw new UnauthorizedError(
      'You are not allowed to cancel invitations.'
    );
  }

  await this.organizationInvitationRepository.update(
    invitationId,
    {
      status:
        OrganizationInvitationStatus.CANCELLED,
      respondedAt: new Date(),
    }
  );

  await this.auditRepository.create(
    new Types.ObjectId(cancelledBy),
    AuditAction.CANCEL_ORGANIZATION_INVITATION,
    AuditEntity.ORGANIZATION,
    invitation.organizationId
  );

  return await this.organizationInvitationRepository.findById(
    invitationId
  );
}
async getOrganizationInvitations(
  organizationId: string
) {
  return this.organizationInvitationRepository.findByOrganization(
    organizationId
  );
}
async getMyInvitations(
  userId: string
) {
  const user =
    await this.userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError(
      'User not found.'
    );
  }

  return this.organizationInvitationRepository.findPendingByEmail(
    user.email
  );
}
}