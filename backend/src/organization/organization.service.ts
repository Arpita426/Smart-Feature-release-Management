import { CreateOrganizationInput } from './organization.validation';
import { OrganizationRepository } from './organization.repository';
import { generateSlug } from '../utils/slug';
import { ConflictError } from '../errors/ConflictError';
import { Types } from 'mongoose';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { OrganizationRole } from '../organization-member/organization-role';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { serializeDoc, serializeDocs } from '../utils/serialize';


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
    return serializeDoc(organization)!;
  }

  async listOrganizations(userId: string) {
    const organizations =
      await this.organizationRepository.findByUserId(userId);

    return serializeDocs(organizations);
  }

  async getOrganizationById(organizationId: string, userId: string) {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const member = await this.organizationMemberRepository.findMember(
      organizationId,
      userId
    );

    if (!member) {
      throw new UnauthorizedError(
        'You are not a member of this organization.'
      );
    }

    return serializeDoc(organization)!;
  }

  async updateOrganization(
    organizationId: string,
    data: { name?: string; description?: string },
    userId: string
  ) {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    const member = await this.organizationMemberRepository.findMember(
      organizationId,
      userId
    );

    if (!member || (member.role !== OrganizationRole.OWNER && member.role !== OrganizationRole.ADMIN)) {
      throw new UnauthorizedError('You are not allowed to update this organization.');
    }

    const updated = await this.organizationRepository.update(organizationId, data);
    return serializeDoc(updated!)!;
  }

  async getOrganizationMembers(organizationId: string, userId: string) {
    const isMember = await this.organizationMemberRepository.isMember(
      organizationId,
      userId
    );

    if (!isMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const members = await this.organizationMemberRepository.findByOrganization(organizationId);
    return serializeDocs(members);
  }
}