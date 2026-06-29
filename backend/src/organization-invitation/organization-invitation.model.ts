import { Document, model, Schema, Types } from 'mongoose';
import { OrganizationInvitationStatus } from './organization-invitation-status';
export interface IOrganizationInvitation extends Document {
  organizationId: Types.ObjectId;

  email: string;

  invitedBy: Types.ObjectId;

  status: OrganizationInvitationStatus;

  respondedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}
const organizationInvitationSchema =
  new Schema<IOrganizationInvitation>(
    {
      organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      status: {
        type: String,
        enum: Object.values(OrganizationInvitationStatus),
        default: OrganizationInvitationStatus.PENDING,
        required: true,
        index: true,
      },

      respondedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );
organizationInvitationSchema.index(
  {
    organizationId: 1,
    email: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: OrganizationInvitationStatus.PENDING,
    },
  }
);
export const OrganizationInvitation =
  model<IOrganizationInvitation>(
    'OrganizationInvitation',
    organizationInvitationSchema
  );