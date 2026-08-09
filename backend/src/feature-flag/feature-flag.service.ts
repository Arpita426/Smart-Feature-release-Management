import { Types } from 'mongoose';

import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';

import { generateSlug } from '../utils/slug';

import { ProjectRepository } from '../project/project.repository';

import { FeatureFlagRepository } from './feature-flag.repository';
import { CreateFeatureFlagInput } from './feature-flag.validation';
import { FeatureFlagStatus } from './feature-flag-status';
import { AuditRepository } from '../audit/audit.repository';
import { AuditAction } from '../audit/audit-action';
import { AuditEntity } from '../audit/audit-entity';
import { serializeDoc, serializeDocs } from '../utils/serialize';
import { EnvironmentRepository } from '../environment/environment.repository';
import { FeatureConfigurationRepository } from '../feature-configuration/feature-configuration.repository';

export class FeatureFlagService {
  private featureFlagRepository = new FeatureFlagRepository();
  private projectRepository = new ProjectRepository();
  private auditRepository = new AuditRepository();
  private environmentRepository = new EnvironmentRepository();
  private featureConfigurationRepository = new FeatureConfigurationRepository();

  async createFeatureFlag(
    featureFlagData: CreateFeatureFlagInput,
    userId: string
  ) {
    // Check project exists
    const project = await this.projectRepository.findById(
      featureFlagData.projectId
    );

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Generate key
    const key = generateSlug(featureFlagData.name);

    // Check duplicate key inside project
    const existingFeatureFlag =
      await this.featureFlagRepository.findByProjectAndKey(
        featureFlagData.projectId,
        key
      );

    if (existingFeatureFlag) {
      throw new ConflictError(
        'Feature flag already exists in this project'
      );
    }

    // Create feature flag
    const featureFlag = await this.featureFlagRepository.create({
      name: featureFlagData.name,
      key,
      description: featureFlagData.description,
      projectId: new Types.ObjectId(featureFlagData.projectId),
      createdBy: new Types.ObjectId(userId),
      status: FeatureFlagStatus.DISABLED,
      rolloutPercentage:
        featureFlagData.rolloutPercentage ?? 0,
    });
    await this.auditRepository.create(
  new Types.ObjectId(userId),
  AuditAction.CREATE_FEATURE_FLAG,
  AuditEntity.FEATURE_FLAG,
  featureFlag._id
);

    const environments = await this.environmentRepository.findByProject(featureFlagData.projectId);
    await Promise.all(
      environments.map((environment) =>
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

    return serializeDoc(featureFlag)!;
  }

  async evaluateFeatureFlag(
  projectId: string,
  key: string,
  userId: string
) {
  // Find feature flag
  const featureFlag =
    await this.featureFlagRepository.findByProjectAndKey(
      projectId,
      key
    );

  if (!featureFlag) {
    throw new NotFoundError('Feature flag not found');
  }

  // Feature disabled
  if (featureFlag.status === FeatureFlagStatus.DISABLED) {
    return {
      enabled: false,
    };
  }

  // 100% rollout
  if (featureFlag.rolloutPercentage >= 100) {
    return {
      enabled: true,
    };
  }

  // 0% rollout
  if (featureFlag.rolloutPercentage <= 0) {
    return {
      enabled: false,
    };
  }

  // Deterministic rollout
  const hash = this.hashUserId(userId);

  return {
    enabled: hash < featureFlag.rolloutPercentage,
  };
}
//async toggleFeatureFlag(id: string)
async toggleFeatureFlag(
  id: string,
  userId: string
)
{
  const featureFlag =
    await this.featureFlagRepository.findById(id);

  if (!featureFlag) {
    throw new NotFoundError('Feature flag not found');
  }

  const newStatus =
    featureFlag.status === FeatureFlagStatus.ENABLED
      ? FeatureFlagStatus.DISABLED
      : FeatureFlagStatus.ENABLED;

  const updatedFeatureFlag =
    await this.featureFlagRepository.toggleStatus(
      id,
      newStatus
    );
    ///
    await this.auditRepository.create(
  new Types.ObjectId(featureFlag.createdBy),
  AuditAction.TOGGLE_FEATURE_FLAG,
  AuditEntity.FEATURE_FLAG,
  featureFlag._id
);
  return serializeDoc(updatedFeatureFlag!)!;
}
async updateRolloutPercentage(
  id: string,
  rolloutPercentage: number,
  userId: string
) {
  const featureFlag =
    await this.featureFlagRepository.findById(id);

  if (!featureFlag) {
    throw new NotFoundError('Feature flag not found');
  }

  const updatedFeatureFlag =
    await this.featureFlagRepository.updateRolloutPercentage(
      id,
      rolloutPercentage
    );
    //
await this.auditRepository.create(
  new Types.ObjectId(userId),
  AuditAction.UPDATE_ROLLOUT,
  AuditEntity.FEATURE_FLAG,
  featureFlag._id
);
  return serializeDoc(updatedFeatureFlag!)!;
}
async getFeatureFlagsByProject(projectId: string) {
  const project =
    await this.projectRepository.findById(projectId);

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const featureFlags =
    await this.featureFlagRepository.findByProject(
      projectId
    );

  return serializeDocs(featureFlags);
}
async getFeatureFlagById(id: string) {
  const featureFlag =
    await this.featureFlagRepository.findById(id);

  if (!featureFlag) {
    throw new NotFoundError('Feature flag not found');
  }

  return serializeDoc(featureFlag)!;
}
async deleteFeatureFlag(id: string) {
  const featureFlag =
    await this.featureFlagRepository.findById(id);

  if (!featureFlag) {
    throw new NotFoundError('Feature flag not found');
  }

  await this.featureFlagRepository.delete(id);

  return {
    message: 'Feature flag deleted successfully',
  };
}
private hashUserId(userId: string): number {
  let hash = 0;

  for (const ch of userId) {
    hash += ch.charCodeAt(0);
  }

  return hash % 100;
}
}
