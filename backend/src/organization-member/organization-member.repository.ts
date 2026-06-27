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
}