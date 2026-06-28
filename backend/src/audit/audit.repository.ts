import { Types } from 'mongoose';
import { Audit } from './audit.model';
import { AuditAction } from './audit-action';

export class AuditRepository {
  async create(
    userId: Types.ObjectId,
    action: AuditAction,
    entity: string,
    entityId: Types.ObjectId
  ) {
    return Audit.create({
      userId,
      action,
      entity,
      entityId,
    });
  }

  async findByEntity(
    entity: string,
    entityId: string
  ) {
    return Audit.find({
      entity,
      entityId,
    }).sort({ createdAt: -1 });
  }

  async findByUser(userId: string) {
    return Audit.find({
      userId,
    }).sort({ createdAt: -1 });
  }
}