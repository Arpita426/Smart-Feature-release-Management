import { Document, model, Schema, Types } from 'mongoose';
import { AuditAction } from './audit-action';

export interface IAudit extends Document {
  userId: Types.ObjectId;

  action: AuditAction;

  entity: string;

  entityId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },

    entity: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Audit = model<IAudit>(
  'Audit',
  auditSchema
);