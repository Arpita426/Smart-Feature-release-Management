import { Types } from 'mongoose';

import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';

import { generateSlug } from '../utils/slug';

import { ProjectRepository } from '../project/project.repository';

import { FeatureFlagRepository } from './feature-flag.repository';
import { CreateFeatureFlagInput } from './feature-flag.validation';
import { FeatureFlagStatus } from './feature-flag-status';

export class FeatureFlagService {
  private featureFlagRepository = new FeatureFlagRepository();
  private projectRepository = new ProjectRepository();

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

    return {
      id: featureFlag._id.toString(),
      name: featureFlag.name,
      key: featureFlag.key,
      description: featureFlag.description,
      status: featureFlag.status,
      rolloutPercentage: featureFlag.rolloutPercentage,
      projectId: featureFlag.projectId,
      createdAt: featureFlag.createdAt,
    };
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
async toggleFeatureFlag(id: string) {
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

  return {
    id: updatedFeatureFlag!._id.toString(),
    status: updatedFeatureFlag!.status,
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