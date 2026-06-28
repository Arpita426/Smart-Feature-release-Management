import { Project, IProject } from './project.model';

export class ProjectRepository {
  async create(data: Partial<IProject>) {
    return Project.create(data);
  }

  async findById(id: string) {
    return Project.findById(id);
  }

  async findByOrganizationAndSlug(
    organizationId: string,
    slug: string
  ) {
    return Project.findOne({
      organizationId,
      slug,
    });
  }

  async findByOrganization(organizationId: string) {
    return Project.find({
      organizationId,
    });
  }

  async update(
    id: string,
    data: Partial<IProject>
  ) {
    return Project.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return Project.findByIdAndDelete(id);
  }
}