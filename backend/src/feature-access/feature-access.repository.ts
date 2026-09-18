import {
  FeatureAccess,
  IFeatureAccess,
} from './feature-access.model';

export class FeatureAccessRepository {
  async create(data: Partial<IFeatureAccess>) {
    return FeatureAccess.create(data);
  }

  async findById(id: string) {
    return FeatureAccess.findById(id);
  }

  async findByFeatureAndUser(
    featureId: string,
    userId: string
  ) {
    return FeatureAccess.findOne({
      featureId,
      userId,
    });
  }

  async findByFeature(featureId: string) {
    return FeatureAccess.find({
      featureId,
    })
      .populate(
        'userId',
        'fullName email avatarUrl'
      )
      .sort({
        createdAt: 1,
      });
  }

  async update(
    id: string,
    data: Partial<IFeatureAccess>
  ) {
    return FeatureAccess.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }

  async delete(id: string) {
    return FeatureAccess.findByIdAndDelete(id);
  }
}