import { Document, model, Schema, Types } from 'mongoose';
import { FeatureFlagStatus } from './feature-flag-status';

export interface IFeatureFlag extends Document {
  name: string;
  key: string;
  description?: string;

  projectId: Types.ObjectId;

  status: FeatureFlagStatus;

  rolloutPercentage: number;

  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(FeatureFlagStatus),
      default: FeatureFlagStatus.DISABLED,
      required: true,
    },

    rolloutPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 Same key cannot exist
 inside the same project.
*/
featureFlagSchema.index(
  {
    projectId: 1,
    key: 1,
  },
  {
    unique: true,
  }
);

export const FeatureFlag = model<IFeatureFlag>(
  'FeatureFlag',
  featureFlagSchema
);