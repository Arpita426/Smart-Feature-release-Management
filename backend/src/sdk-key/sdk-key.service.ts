import crypto from 'crypto';
import { Types } from 'mongoose';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { ConflictError } from '../errors/ConflictError';
import { ProjectRepository } from '../project/project.repository';
import { EnvironmentRepository } from '../environment/environment.repository';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';
import { OrganizationRole } from '../organization-member/organization-role';
import { ProjectMemberRepository } from '../project-member/project-member.repository';
import { serializeDoc, serializeDocs } from '../utils/serialize';
import { SDKKeyRepository } from './sdk-key.repository';
import { SDKKeyStatus } from './sdk-key.model';
import { CreateSDKKeyInput } from './sdk-key.validation';

export class SDKKeyService {
  private sdkKeyRepository = new SDKKeyRepository();
  private projectRepository = new ProjectRepository();
  private environmentRepository = new EnvironmentRepository();
  private organizationMemberRepository = new OrganizationMemberRepository();
  private projectMemberRepository = new ProjectMemberRepository();

  private async checkProjectAndEnvironmentAccess(
    projectId: string,
    environmentId: string,
    userId: string,
    requireAdmin: boolean = false
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const environment = await this.environmentRepository.findById(environmentId);
    if (!environment || environment.projectId.toString() !== projectId) {
      throw new NotFoundError('Environment not found or does not belong to this project');
    }

    const orgMember = await this.organizationMemberRepository.findMember(
      project.organizationId.toString(),
      userId
    );
    if (!orgMember) {
      throw new UnauthorizedError('You are not a member of this organization.');
    }

    const projectMember = await this.projectMemberRepository.findMember(projectId, userId);

    if (requireAdmin) {
      const isOrgAdminOrOwner =
        orgMember.role === OrganizationRole.OWNER || orgMember.role === OrganizationRole.ADMIN;
      const isProjectAdmin =
        projectMember && (projectMember.role === 'OWNER' || projectMember.role === 'MAINTAINER');

      if (!isOrgAdminOrOwner && !isProjectAdmin) {
        throw new UnauthorizedError('You do not have permission to manage SDK keys.');
      }
    }

    return { project, environment, orgMember, projectMember };
  }

  async createSDKKey(
    projectId: string,
    environmentId: string,
    data: CreateSDKKeyInput,
    userId: string
  ) {
    const { environment } = await this.checkProjectAndEnvironmentAccess(
      projectId,
      environmentId,
      userId,
      true
    );

    const envPrefix = (environment.slug || 'env').substring(0, 4);
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `rf_${envPrefix}_${randomBytes}`;
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const created = await this.sdkKeyRepository.create({
      projectId: new Types.ObjectId(projectId),
      environmentId: new Types.ObjectId(environmentId),
      name: data.name,
      keyHash,
      keyPrefix,
      status: SDKKeyStatus.ACTIVE,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      createdBy: new Types.ObjectId(userId),
    });

    const serialized = serializeDoc<Record<string, unknown>>(created);

    return {
      ...serialized,
      key: rawKey, // Included ONLY ONCE upon creation!
    };
  }

  async listSDKKeys(projectId: string, environmentId: string, userId: string) {
    await this.checkProjectAndEnvironmentAccess(projectId, environmentId, userId, false);

    const keys = await this.sdkKeyRepository.findByProjectAndEnvironment(projectId, environmentId);
    return serializeDocs(keys);
  }

  async revokeSDKKey(
    projectId: string,
    environmentId: string,
    keyId: string,
    userId: string
  ) {
    await this.checkProjectAndEnvironmentAccess(projectId, environmentId, userId, true);

    const key = await this.sdkKeyRepository.findById(keyId);
    if (!key || key.projectId.toString() !== projectId || key.environmentId.toString() !== environmentId) {
      throw new NotFoundError('SDK Key not found');
    }

    const updated = await this.sdkKeyRepository.updateStatus(keyId, SDKKeyStatus.REVOKED);
    return serializeDoc(updated);
  }

  async regenerateSDKKey(
    projectId: string,
    environmentId: string,
    keyId: string,
    userId: string
  ) {
    await this.checkProjectAndEnvironmentAccess(projectId, environmentId, userId, true);

    const key = await this.sdkKeyRepository.findById(keyId);
    if (!key || key.projectId.toString() !== projectId || key.environmentId.toString() !== environmentId) {
      throw new NotFoundError('SDK Key not found');
    }

    // Revoke old key
    await this.sdkKeyRepository.updateStatus(keyId, SDKKeyStatus.REVOKED);

    // Create new key with same name
    return await this.createSDKKey(
      projectId,
      environmentId,
      { name: key.name },
      userId
    );
  }
}
