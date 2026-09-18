import { Document, model, Schema, Types } from 'mongoose';

export interface IFeatureAccess extends Document {
  featureId: Types.ObjectId;
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const featureAccessSchema = new Schema<IFeatureAccess>(
  {
    featureId: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureFlag',
      required: true,
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    permissions: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

featureAccessSchema.index(
  {
    featureId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export const FeatureAccess =
  model<IFeatureAccess>(
    'FeatureAccess',
    featureAccessSchema
  );