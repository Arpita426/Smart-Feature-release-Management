import { Types } from 'mongoose';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { generateSlug } from '../utils/slug';

import { OrganizationRepository } from '../organization/organization.repository';
import { ProjectRepository } from './project.repository';
import { CreateProjectInput } from './project.validation';

export class ProjectService {
  private projectRepository = new ProjectRepository();
  private organizationRepository = new OrganizationRepository();

  async createProject(
    projectData: CreateProjectInput,
    userId: string
  ) {
    // Check organization exists
    const organization =
      await this.organizationRepository.findById(
        projectData.organizationId
      );

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    // Generate slug
    const slug = generateSlug(projectData.name);

    // Check duplicate project
    const existingProject =
      await this.projectRepository.findByOrganizationAndSlug(
        projectData.organizationId,
        slug
      );

    if (existingProject) {
      throw new ConflictError(
        'Project already exists in this organization'
      );
    }

    // Create project
    const project = await this.projectRepository.create({
      name: projectData.name,
      slug,
      description: projectData.description,
      organizationId: new Types.ObjectId(projectData.organizationId),
      createdBy: new Types.ObjectId(userId),
    });

    return {
      id: project._id.toString(),
      name: project.name,
      slug: project.slug,
      description: project.description,
      organizationId: project.organizationId,
      createdAt: project.createdAt,
    };
  }
}