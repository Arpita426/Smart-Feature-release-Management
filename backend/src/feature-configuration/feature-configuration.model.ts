import { Document, model, Schema, Types } from 'mongoose';

export interface IFeatureConfiguration extends Document {
  featureId: Types.ObjectId;
  environmentId: Types.ObjectId;
  enabled: boolean;
  rolloutPercentage: number;
  killSwitch: boolean;
  targetingRules?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const featureConfigurationSchema = new Schema<IFeatureConfiguration>(
  {
    featureId: {
      type: Schema.Types.ObjectId,
      ref: 'FeatureFlag',
      required: true,
      index: true,
    },
    environmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    rolloutPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    killSwitch: {
      type: Boolean,
      default: false,
    },
    targetingRules: {
      type: Schema.Types.Mixed,
      default: {},
    },
    variables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
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

featureConfigurationSchema.index(
  {
    featureId: 1,
    environmentId: 1,
  },
  {
    unique: true,
  }
);

export const FeatureConfiguration = model<IFeatureConfiguration>(
  'FeatureConfiguration',
  featureConfigurationSchema
);
