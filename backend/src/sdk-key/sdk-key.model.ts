import { Document, model, Schema, Types } from 'mongoose';

export enum SDKKeyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export interface ISDKKey extends Document {
  projectId: Types.ObjectId;
  environmentId: Types.ObjectId;
  name: string;
  keyHash: string;
  keyPrefix: string;
  status: SDKKeyStatus;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sdkKeySchema = new Schema<ISDKKey>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    environmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyPrefix: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(SDKKeyStatus),
      default: SDKKeyStatus.ACTIVE,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
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

sdkKeySchema.index({ projectId: 1, environmentId: 1 });

export const SDKKey = model<ISDKKey>('SDKKey', sdkKeySchema);
