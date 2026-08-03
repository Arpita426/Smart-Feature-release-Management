import { OrganizationMember } from '../organization-member/organization-member.model';
import { Organization, IOrganization } from './organization.model';

export class OrganizationRepository {
  async create(data: Partial<IOrganization>) {
    return Organization.create(data);
  }

  async findById(id: string) {
    return Organization.findById(id);
  }

  async findBySlug(slug: string) {
    return Organization.findOne({ slug });
  }

async findByUserId(userId: string) {
    const memberships = await OrganizationMember.find({ userId }).select(
      'organizationId'
    );

    const organizationIds = memberships.map((membership) =>
      membership.organizationId.toString()
    );

    if (organizationIds.length === 0) {
      return [];
    }

    return Organization.find({
      _id: { $in: organizationIds },
    }).sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IOrganization>) {
    return Organization.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Organization.findByIdAndDelete(id);
  }
}