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
import { IOrganizationInvitation } from './organization-invitation.model';

export class OrganizationInvitationService {
    private organizationInvitationRepository =
  new OrganizationInvitationRepository();

private organizationRepository =
  new OrganizationRepository();

private organizationMemberRepository =
  new OrganizationMemberRepository();

private userRepository =
  new UserRepository();

  private auditRepository =
  new AuditRepository();
    private async getPendingInvitation(
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
    email
  );

if (pendingInvitation) {
  throw new ConflictError(
    'A pending invitation already exists for this email.'
  );
}
const invitation =
  await this.organizationInvitationRepository.create({
    organizationId: organization._id,
    email: email.toLowerCase(),
    invitedBy: inviter.userId,
  });
  // TODO: Send invitation email

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
    async acceptInvitation(
  invitationId: string,
  userId: string
) {
    //
  const invitation =
  await this.getPendingInvitation(
    invitationId
  );
//
const user =
  await this.getInvitationUser(
    invitation,
    userId
  );
//
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
await this.organizationInvitationRepository.update(
  invitationId,
  {
    status:
      OrganizationInvitationStatus.ACCEPTED,
    respondedAt: new Date(),
  }
);
await this.auditRepository.create(
  user._id,
  AuditAction.ACCEPT_ORGANIZATION_INVITATION,
  AuditEntity.ORGANIZATION,
  invitation.organizationId
);

return await this.organizationInvitationRepository.findById(
    invitationId
);
//
}
async rejectInvitation(
  invitationId: string,
  userId: string
) {
  const invitation =
    await this.getPendingInvitation(
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
    await this.getPendingInvitation(
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