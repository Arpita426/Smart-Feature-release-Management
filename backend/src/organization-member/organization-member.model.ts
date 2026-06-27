import { Document, model, Schema, Types } from 'mongoose';
import { OrganizationRole } from './organization-role';

export interface IOrganizationMember extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
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
      enum: Object.values(OrganizationRole),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 One user cannot have multiple memberships
 in the same organization.
*/
organizationMemberSchema.index(
  {
    organizationId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export const OrganizationMember = model<IOrganizationMember>(
  'OrganizationMember',
  organizationMemberSchema
);