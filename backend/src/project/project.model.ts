import { Document, model, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  slug: string;
  description?: string;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
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
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
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
  Project names/slugs should be unique
  only inside the same organization.
*/
projectSchema.index(
  {
    organizationId: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

export const Project = model<IProject>(
  'Project',
  projectSchema
);