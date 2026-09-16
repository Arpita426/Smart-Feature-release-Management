// import { Document, model, Schema, Types } from 'mongoose';
// import { OrganizationInvitationStatus } from './organization-invitation-status';
// export interface IOrganizationInvitation extends Document {
//   organizationId: Types.ObjectId;

//   email: string;

//   invitedBy: Types.ObjectId;

//   status: OrganizationInvitationStatus;

//   respondedAt?: Date;

//   createdAt: Date;

//   updatedAt: Date;
// }
// const organizationInvitationSchema =
//   new Schema<IOrganizationInvitation>(
//     {
//       organizationId: {
//         type: Schema.Types.ObjectId,
//         ref: 'Organization',
//         required: true,
//         index: true,
//       },

//       email: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true,
//         index: true,
//       },

//       invitedBy: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//       },

//       status: {
//         type: String,
//         enum: Object.values(OrganizationInvitationStatus),
//         default: OrganizationInvitationStatus.PENDING,
//         required: true,
//         index: true,
//       },

//       respondedAt: {
//         type: Date,
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );
// organizationInvitationSchema.index(
//   {
//     organizationId: 1,
//     email: 1,
//     status: 1,
//   },
//   {
//     unique: true,
//     partialFilterExpression: {
//       status: OrganizationInvitationStatus.PENDING,
//     },
//   }
// );
// export const OrganizationInvitation =
//   model<IOrganizationInvitation>(
//     'OrganizationInvitation',
//     organizationInvitationSchema
//   );


import { Document, model, Schema, Types } from 'mongoose';

import { OrganizationInvitationStatus } from './organization-invitation-status';
import { InvitationScope } from './invitation-scope';

export interface IOrganizationInvitation extends Document {
  organizationId: Types.ObjectId;

  scope: InvitationScope;

  targetId: Types.ObjectId;

  email: string;

  inviteeId?: Types.ObjectId;

  role?: string;

  permissions?: string[];

  invitedBy: Types.ObjectId;

  tokenHash: string;

  status: OrganizationInvitationStatus;

  expiresAt: Date;

  acceptedAt?: Date;

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

      scope: {
        type: String,
        enum: Object.values(InvitationScope),
        required: true,
        index: true,
      },

      targetId: {
        type: Schema.Types.ObjectId,
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

      inviteeId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },

      role: {
        type: String,
      },

      permissions: {
        type: [String],
        default: [],
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      tokenHash: {
        type: String,
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: Object.values(OrganizationInvitationStatus),
        default: OrganizationInvitationStatus.PENDING,
        required: true,
        index: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      acceptedAt: {
        type: Date,
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
    scope: 1,
    targetId: 1,
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