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

  async findByOwner(ownerId: string) {
    return Organization.find({ ownerId });
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