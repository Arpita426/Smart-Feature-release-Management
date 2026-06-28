import { FeatureFlag, IFeatureFlag } from './feature-flag.model';
import { FeatureFlagStatus } from './feature-flag-status';

export class FeatureFlagRepository {
  async create(data: Partial<IFeatureFlag>) {
    return FeatureFlag.create(data);
  }

  async findById(id: string) {
    return FeatureFlag.findById(id);
  }

  async findByProjectAndKey(
    projectId: string,
    key: string
  ) {
    return FeatureFlag.findOne({
      projectId,
      key,
    });
  }

  async findByProject(projectId: string) {
    return FeatureFlag.find({
      projectId,
    });
  }

  async update(
    id: string,
    data: Partial<IFeatureFlag>
  ) {
    return FeatureFlag.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return FeatureFlag.findByIdAndDelete(id);
  }

  async toggleStatus(
  id: string,
  status: FeatureFlagStatus
) {
  return FeatureFlag.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
    }
  );
}
async updateRolloutPercentage(
  id: string,
  rolloutPercentage: number
) {
  return FeatureFlag.findByIdAndUpdate(
    id,
    { rolloutPercentage },
    {
      new: true,
    }
  );
}

}