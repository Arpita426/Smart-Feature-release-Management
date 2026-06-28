import { Types } from 'mongoose';
import { Audit } from './audit.model';
import { AuditAction } from './audit-action';
import { AuditEntity } from './audit-entity';

export class AuditRepository {
  async create(
  userId: Types.ObjectId,
  action: AuditAction,
  entity: AuditEntity,
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
  entity: AuditEntity,
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