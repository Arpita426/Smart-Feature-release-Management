import { Schema, model, Document, Types } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    // ownerId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    //   index: true,
    // },

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

export const Organization = model<IOrganization>(
  'Organization',
  organizationSchema
);