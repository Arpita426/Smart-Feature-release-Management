import { NotFoundError } from '../errors/NotFoundError';
import { FeatureFlagRepository } from '../feature-flag/feature-flag.repository';
import { FeatureConfigurationRepository } from '../feature-configuration/feature-configuration.repository';
import { EnvironmentRepository } from '../environment/environment.repository';
import { SDKContext } from '../types/express';
import { FeatureFlagStatus } from '../feature-flag/feature-flag-status';

export class SDKService {
  private featureFlagRepository = new FeatureFlagRepository();
  private featureConfigurationRepository = new FeatureConfigurationRepository();
  private environmentRepository = new EnvironmentRepository();

  async getAllFeatures(sdkContext: SDKContext) {
    const environment = await this.environmentRepository.findById(sdkContext.environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const featureFlags = await this.featureFlagRepository.findByProject(sdkContext.projectId);

    const features = await Promise.all(
      featureFlags.map(async (flag) => {
        const config = await this.featureConfigurationRepository.findByFeatureAndEnvironment(
          flag._id.toString(),
          sdkContext.environmentId
        );

        return {
          key: flag.key,
          enabled: config ? config.enabled : flag.status === FeatureFlagStatus.ENABLED,
          rolloutPercentage: config ? config.rolloutPercentage : flag.rolloutPercentage,
          killSwitch: config ? config.killSwitch : false,
          targetingRules: config?.targetingRules ?? {},
          variables: config?.variables ?? {},
        };
      })
    );

    return {
      environment: environment.slug || environment.name.toLowerCase(),
      features,
    };
  }

  async getSingleFeature(sdkContext: SDKContext, featureKey: string) {
    const flag = await this.featureFlagRepository.findByProjectAndKey(
      sdkContext.projectId,
      featureKey
    );

    if (!flag) {
      throw new NotFoundError('Feature flag not found');
    }

    const config = await this.featureConfigurationRepository.findByFeatureAndEnvironment(
      flag._id.toString(),
      sdkContext.environmentId
    );

    return {
      key: flag.key,
      enabled: config ? config.enabled : flag.status === FeatureFlagStatus.ENABLED,
      rolloutPercentage: config ? config.rolloutPercentage : flag.rolloutPercentage,
      killSwitch: config ? config.killSwitch : false,
      targetingRules: config?.targetingRules ?? {},
      variables: config?.variables ?? {},
    };
  }
}
