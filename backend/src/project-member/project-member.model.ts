import { Document, model, Schema, Types } from 'mongoose';
import { ProjectRole } from './project-role';

export interface IProjectMember extends Document {
  organizationId: Types.ObjectId;

  projectId: Types.ObjectId;

  userId: Types.ObjectId;

  role: ProjectRole;

  addedBy: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

const projectMemberSchema =
  new Schema<IProjectMember>(
    {
      organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
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

      role: {
        type: String,
        enum: Object.values(ProjectRole),
        required: true,
      },

      addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

projectMemberSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export const ProjectMember = model<IProjectMember>(
  'ProjectMember',
  projectMemberSchema
);