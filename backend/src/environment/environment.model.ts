import { Document, model, Schema, Types } from 'mongoose';

export interface IEnvironment extends Document {
  projectId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order: number;
  isSystem: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const environmentSchema = new Schema<IEnvironment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
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
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '#2563eb',
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isSystem: {
      type: Boolean,
      default: false,
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

environmentSchema.pre('validate' as any, function (this: IEnvironment) {
  if (!this.slug || this.isModified('name')) {
    const name = this.name?.trim();
    if (name) {
      this.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  if (typeof this.isSystem !== 'boolean') {
    this.isSystem = false;
  }
});

environmentSchema.index(
  {
    projectId: 1,
    slug: 1,
  },
  {
    unique: true,
  }
);

environmentSchema.index({ projectId: 1, order: 1 });

export const Environment = model<IEnvironment>(
  'Environment',
  environmentSchema
);
