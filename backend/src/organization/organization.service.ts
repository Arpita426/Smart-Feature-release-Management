import { CreateOrganizationInput } from './organization.validation';
import { OrganizationRepository } from './organization.repository';
import { generateSlug } from '../utils/slug';
import { ConflictError } from '../errors/ConflictError';
import { Types } from 'mongoose';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { OrganizationRole } from '../organization-member/organization-role';


export class OrganizationService {
  private organizationRepository = new OrganizationRepository();
  private organizationMemberRepository =
  new OrganizationMemberRepository();

  async createOrganization(
    organizationData: CreateOrganizationInput,
    userId: string
  ) {
    const slug = generateSlug(organizationData.name);

    const existingOrganization =
      await this.organizationRepository.findBySlug(slug);

    if (existingOrganization) {
      throw new ConflictError('Organization already exists');
    }

 //const ownerId = new Types.ObjectId(userId);

const organization = await this.organizationRepository.create({
  ...organizationData,
  slug,
  createdBy: new Types.ObjectId(userId),
});
    await this.organizationMemberRepository.create(
  organization._id,
  new Types.ObjectId(userId),
  OrganizationRole.OWNER
);
    return {
  id: organization._id.toString(),
  name: organization.name,
  slug: organization.slug,
  description: organization.description,
  createdAt: organization.createdAt,
};
  }
  
}