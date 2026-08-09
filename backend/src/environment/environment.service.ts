import { Types } from 'mongoose';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { ProjectRepository } from '../project/project.repository';
import { ProjectMemberRepository } from '../project-member/project-member.repository';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { OrganizationRole } from '../organization-member/organization-role';
import { FeatureFlagRepository } from '../feature-flag/feature-flag.repository';
import { serializeDoc, serializeDocs } from '../utils/serialize';
import { generateSlug } from '../utils/slug';
import { EnvironmentRepository } from './environment.repository';
import { FeatureConfigurationRepository } from '../feature-configuration/feature-configuration.repository';
import { CreateEnvironmentInput, CreateFeatureConfigurationInput } from './environment.validation';

export class EnvironmentService {
  private environmentRepository = new EnvironmentRepository();
  private featureConfigurationRepository = new FeatureConfigurationRepository();
  private projectRepository = new ProjectRepository();
  private projectMemberRepository = new ProjectMemberRepository();
  private organizationMemberRepository = new OrganizationMemberRepository();
  private featureFlagRepository = new FeatureFlagRepository();

  async listEnvironmentsByProject(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const environments = await this.environmentRepository.findByProject(projectId);
    return serializeDocs(environments);
  }

  async createEnvironment(projectId: string, data: CreateEnvironmentInput, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projectMember = await this.projectMemberRepository.findMember(projectId, userId);
    const isOrgAdminOrOwner = organizationMember.role === OrganizationRole.OWNER || organizationMember.role === OrganizationRole.ADMIN;
    const isProjectAdmin = projectMember && projectMember.role === 'OWNER';

    if (!isOrgAdminOrOwner && !isProjectAdmin) {
      throw new UnauthorizedError('You are not allowed to create environments.');
    }

    const slug = generateSlug(data.name);
    const existing = await this.environmentRepository.findByProjectAndSlug(projectId, slug);
    if (existing) {
      throw new ConflictError('Environment already exists in this project');
    }

    const environment = await this.environmentRepository.create({
      projectId: new Types.ObjectId(projectId),
      name: data.name,
      slug,
      description: data.description ?? '',
      color: data.color ?? '#2563eb',
      order: data.order ?? 0,
      isDefault: Boolean(data.isDefault),
      createdBy: new Types.ObjectId(userId),
    });

    const featureFlags = await this.featureFlagRepository.findByProject(projectId);
    await Promise.all(
      featureFlags.map((featureFlag) =>
        this.featureConfigurationRepository.create({
          featureId: featureFlag._id,
          environmentId: environment._id,
          enabled: false,
          rolloutPercentage: 0,
          killSwitch: false,
          targetingRules: {},
          variables: {},
          updatedBy: new Types.ObjectId(userId),
        })
      )
    );

    return serializeDoc(environment)!;
  }

  async getEnvironmentById(environmentId: string, userId: string) {
    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const project = await this.projectRepository.findById(environment.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    return serializeDoc(environment)!;
  }

  async updateEnvironment(environmentId: string, data: Partial<CreateEnvironmentInput>, userId: string) {
    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const project = await this.projectRepository.findById(environment.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projectMember = await this.projectMemberRepository.findMember(project._id.toString(), userId);
    const isOrgAdminOrOwner = organizationMember.role === OrganizationRole.OWNER || organizationMember.role === OrganizationRole.ADMIN;
    const isProjectAdmin = projectMember && projectMember.role === 'OWNER';

    if (!isOrgAdminOrOwner && !isProjectAdmin) {
      throw new UnauthorizedError('You are not allowed to update environments.');
    }

    if (data.name) {
      const slug = generateSlug(data.name);
      const existing = await this.environmentRepository.findByProjectAndSlug(environment.projectId.toString(), slug);
      if (existing && existing._id.toString() !== environmentId) {
        throw new ConflictError('Environment already exists in this project');
      }
      (data as any).slug = slug;
    }

    const updated = await this.environmentRepository.update(environmentId, data);
    return serializeDoc(updated)!;
  }

  async deleteEnvironment(environmentId: string, userId: string) {
    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const project = await this.projectRepository.findById(environment.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projectMember = await this.projectMemberRepository.findMember(project._id.toString(), userId);
    const isOrgAdminOrOwner = organizationMember.role === OrganizationRole.OWNER || organizationMember.role === OrganizationRole.ADMIN;
    const isProjectAdmin = projectMember && projectMember.role === 'OWNER';

    if (!isOrgAdminOrOwner && !isProjectAdmin) {
      throw new UnauthorizedError('You are not allowed to delete environments.');
    }

    await this.environmentRepository.delete(environmentId);
    return { message: 'Environment deleted successfully' };
  }

  async listConfigurationsByFeature(featureId: string, userId: string) {
    const featureFlag = await this.featureFlagRepository.findById(featureId);
    if (!featureFlag) {
      throw new NotFoundError('Feature flag not found');
    }

    const project = await this.projectRepository.findById(featureFlag.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const configurations = await this.featureConfigurationRepository.findByFeature(featureId);
    return serializeDocs(configurations);
  }

  async getConfigurationByEnvironment(featureId: string, environmentId: string, userId: string) {
    const featureFlag = await this.featureFlagRepository.findById(featureId);
    if (!featureFlag) {
      throw new NotFoundError('Feature flag not found');
    }

    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const project = await this.projectRepository.findById(featureFlag.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const configuration = await this.featureConfigurationRepository.findByFeatureAndEnvironment(featureId, environmentId);
    if (!configuration) {
      throw new NotFoundError('Feature configuration not found');
    }

    return serializeDoc(configuration)!;
  }

  async upsertConfiguration(featureId: string, environmentId: string, data: CreateFeatureConfigurationInput, userId: string) {
    const featureFlag = await this.featureFlagRepository.findById(featureId);
    if (!featureFlag) {
      throw new NotFoundError('Feature flag not found');
    }

    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const project = await this.projectRepository.findById(featureFlag.projectId.toString());
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const organizationMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );

    if (!organizationMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projectMember = await this.projectMemberRepository.findMember(project._id.toString(), userId);
    const isOrgAdminOrOwner = organizationMember.role === OrganizationRole.OWNER || organizationMember.role === OrganizationRole.ADMIN;
    const isProjectAdmin = projectMember && projectMember.role === 'OWNER';

    if (!isOrgAdminOrOwner && !isProjectAdmin) {
      throw new UnauthorizedError('You are not allowed to update feature configurations.');
    }

    const configuration = await this.featureConfigurationRepository.upsert(featureId, environmentId, {
      ...data,
      updatedBy: new Types.ObjectId(userId),
    });

    return serializeDoc(configuration)!;
  }
}
