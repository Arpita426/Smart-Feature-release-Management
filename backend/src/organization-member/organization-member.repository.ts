import { Types } from 'mongoose';
import { OrganizationMember } from './organization-member.model';
import { OrganizationRole } from './organization-role';

export class OrganizationMemberRepository {
  async create(
    organizationId: Types.ObjectId,
    userId: Types.ObjectId,
    role: OrganizationRole
  ) {
    return OrganizationMember.create({
      organizationId,
      userId,
      role,
    });
  }
  async findMember(
  organizationId: string,
  userId: string
) {
  return OrganizationMember.findOne({
    organizationId,
    userId,
  });
}

async findByOrganization(
  organizationId: string
) {
  return OrganizationMember.find({
    organizationId,
  })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 });
}

async updateRole(
  organizationId: string,
  userId: string,
  role: OrganizationRole
) {
  return OrganizationMember.findOneAndUpdate(
    {
      organizationId,
      userId,
    },
    {
      role,
    },
    {
      new: true,
    }
  );
}

async removeMember(
  organizationId: string,
  userId: string
) {
  return OrganizationMember.findOneAndDelete({
    organizationId,
    userId,
  });
}
//
async isMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const member = await OrganizationMember.findOne({
    organizationId,
    userId,
  });

  return !!member;
}

async isAdminOrOwner(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const member = await OrganizationMember.findOne({
    organizationId,
    userId,
    role: {
      $in: [
        OrganizationRole.OWNER,
        OrganizationRole.ADMIN,
      ],
    },
  });

  return !!member;
}

async getMember(
  organizationId: string,
  userId: string
) {
  return OrganizationMember.findOne({
    organizationId,
    userId,
  });
}
}