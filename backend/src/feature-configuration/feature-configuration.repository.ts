import { FeatureConfiguration, IFeatureConfiguration } from './feature-configuration.model';

export class FeatureConfigurationRepository {
  async create(data: Partial<IFeatureConfiguration>) {
    return FeatureConfiguration.create(data);
  }

  async findByFeatureAndEnvironment(featureId: string, environmentId: string) {
    return FeatureConfiguration.findOne({ featureId, environmentId });
  }

  async findByFeature(featureId: string) {
    return FeatureConfiguration.find({ featureId }).sort({ createdAt: 1 });
  }

  async update(id: string, data: Partial<IFeatureConfiguration>) {
    return FeatureConfiguration.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteByEnvironment(environmentId: string) {
    return FeatureConfiguration.deleteMany({ environmentId });
  }

  async upsert(featureId: string, environmentId: string, data: Partial<IFeatureConfiguration>) {
    return FeatureConfiguration.findOneAndUpdate(
      { featureId, environmentId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }
}
