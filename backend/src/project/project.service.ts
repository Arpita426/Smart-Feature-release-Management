import { Types } from 'mongoose';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { generateSlug } from '../utils/slug';

import { OrganizationRepository } from '../organization/organization.repository';
import { ProjectRepository } from './project.repository';
import { CreateProjectInput } from './project.validation';
import { ProjectMemberRepository } from '../project-member/project-member.repository';
import { ProjectRole } from '../project-member/project-role';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { OrganizationRole } from '../organization-member/organization-role';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { serializeDoc, serializeDocs } from '../utils/serialize';

export class ProjectService {
  private projectRepository = new ProjectRepository();
  private organizationRepository = new OrganizationRepository();
    private projectMemberRepository =
  new ProjectMemberRepository();
  private organizationMemberRepository =
  new OrganizationMemberRepository();
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
    const organizationMember =
  await this.organizationMemberRepository.findMember(
    projectData.organizationId,
    userId
  );

if (!organizationMember) {
  throw new UnauthorizedError(
    'You are not a member of this organization.'
  );
}

if (
  organizationMember.role !== OrganizationRole.OWNER &&
  organizationMember.role !== OrganizationRole.ADMIN
) {
  throw new UnauthorizedError(
    'You are not allowed to create projects.'
  );
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
    await this.projectMemberRepository.create({
  organizationId: project.organizationId,
  projectId: project._id,
  userId: new Types.ObjectId(userId),
  role: ProjectRole.OWNER,
  addedBy: new Types.ObjectId(userId),
});
    return serializeDoc(project)!;
  }

  async listProjectsByOrganization(organizationId: string, userId: string) {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const organizationMember =
      await this.organizationMemberRepository.findMember(
        organizationId,
        userId
      );

    if (!organizationMember) {
      throw new UnauthorizedError(
        'You are not a member of this organization.'
      );
    }

    const projects =
      await this.projectRepository.findByOrganization(organizationId);

    return serializeDocs(projects);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember =
      await this.organizationMemberRepository.findMember(
        project.organizationId.toString(),
        userId
      );

    if (!organizationMember) {
      throw new UnauthorizedError(
        'You are not a member of this organization.'
      );
    }

    return serializeDoc(project)!;
  }

  async updateProject(
    projectId: string,
    data: { name?: string; description?: string },
    userId: string
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const orgMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!orgMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projMember = await this.projectMemberRepository.findMember(
      projectId,
      userId
    );

    const isOrgAdminOrOwner = orgMember.role === OrganizationRole.OWNER || orgMember.role === OrganizationRole.ADMIN;
    const isProjOwner = projMember && projMember.role === ProjectRole.OWNER;

    if (!isOrgAdminOrOwner && !isProjOwner) {
      throw new UnauthorizedError('You are not allowed to update this project.');
    }

    const updated = await this.projectRepository.update(projectId, data);
    return serializeDoc(updated!)!;
  }
}
