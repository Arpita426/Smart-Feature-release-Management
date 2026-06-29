import { Types } from 'mongoose';

import { ProjectMemberRepository } from './project-member.repository';
import { ProjectRepository } from '../project/project.repository';
import { OrganizationMemberRepository } from '../organization-member/organization-member.repository';

import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';

import { OrganizationRole } from '../organization-member/organization-role';
import { ProjectRole } from './project-role';

import { AuditRepository } from '../audit/audit.repository';
import { AuditAction } from '../audit/audit-action';
import { AuditEntity } from '../audit/audit-entity';

export class ProjectMemberService {
    private projectMemberRepository =
  new ProjectMemberRepository();

private projectRepository =
  new ProjectRepository();

private organizationMemberRepository =
  new OrganizationMemberRepository();

private auditRepository =
  new AuditRepository();
private async getAuthorizedOrganizationAdmin(
  organizationId: string,
  userId: string
) {
  const member =
    await this.organizationMemberRepository.findMember(
      organizationId,
      userId
    );

  if (!member) {
    throw new UnauthorizedError(
      'You are not a member of this organization.'
    );
  }

  if (
    member.role !== OrganizationRole.OWNER &&
    member.role !== OrganizationRole.ADMIN
  ) {
    throw new UnauthorizedError(
      'You are not allowed to manage project members.'
    );
  }
//
  return member;
}
  async addMember(
  projectId: string,
  userId: string,
  role: ProjectRole,
  addedBy: string
) {
    const project =
  await this.projectRepository.findById(
    projectId
  );

if (!project) {
  throw new NotFoundError(
    'Project not found.'
  );
}
const organizationMember =
  await this.organizationMemberRepository.findMember(
    project.organizationId.toString(),
    addedBy
  );

if (!organizationMember) {
  throw new UnauthorizedError(
    'You are not a member of this organization.'
  );
}

if (
  organizationMember.role !== OrganizationRole.OWNER &&
  organizationMember.role !== OrganizationRole.ADMIN
) {
  throw new UnauthorizedError(
    'You are not allowed to manage project members.'
  );
}
const targetOrganizationMember =
  await this.organizationMemberRepository.findMember(
    project.organizationId.toString(),
    userId
  );

if (!targetOrganizationMember) {
  throw new ConflictError(
    'User is not a member of this organization.'
  );
}
const existingProjectMember =
  await this.projectMemberRepository.findMember(
    projectId,
    userId
  );

if (existingProjectMember) {
  throw new ConflictError(
    'User is already a member of this project.'
  );
}
const projectMember =
  await this.projectMemberRepository.create({
    organizationId: project.organizationId,
    projectId: project._id,
    userId: targetOrganizationMember.userId,
    role,
    addedBy: new Types.ObjectId(addedBy),
  });
  await this.auditRepository.create(
  new Types.ObjectId(addedBy),
  AuditAction.ADD_PROJECT_MEMBER,
  AuditEntity.PROJECT,
  project._id
);

return projectMember;
}
async getProjectMembers(
  projectId: string,
  requestedBy: string
) {
  const project =
    await this.projectRepository.findById(projectId);

  if (!project) {
    throw new NotFoundError(
      'Project not found.'
    );
  }

  await this.getAuthorizedOrganizationAdmin(
    project.organizationId.toString(),
    requestedBy
  );

  return this.projectMemberRepository.findByProject(
    projectId
  );
}
async changeRole(
  projectMemberId: string,
  role: ProjectRole,
  updatedBy: string
) {
  const projectMember =
    await this.projectMemberRepository.findById(
      projectMemberId
    );

  if (!projectMember) {
    throw new NotFoundError(
      'Project member not found.'
    );
  }
if (projectMember.role === ProjectRole.OWNER) {
  throw new ConflictError(
    'Project owner role cannot be changed.'
  );
}
  await this.getAuthorizedOrganizationAdmin(
    projectMember.organizationId.toString(),
    updatedBy
  );

  const updatedMember =
    await this.projectMemberRepository.update(
      projectMemberId,
      {
        role,
      }
    );

  await this.auditRepository.create(
    new Types.ObjectId(updatedBy),
    AuditAction.UPDATE_PROJECT_MEMBER_ROLE,
    AuditEntity.PROJECT,
    projectMember.projectId
  );

  return updatedMember;
}
async removeMember(
  projectMemberId: string,
  removedBy: string
) {
  const projectMember =
    await this.projectMemberRepository.findById(
      projectMemberId
    );

  if (!projectMember) {
    throw new NotFoundError(
      'Project member not found.'
    );
  }

  if (projectMember.role === ProjectRole.OWNER) {
    throw new ConflictError(
      'Project owner cannot be removed.'
    );
  }

  await this.getAuthorizedOrganizationAdmin(
    projectMember.organizationId.toString(),
    removedBy
  );

  await this.projectMemberRepository.delete(
    projectMemberId
  );

  await this.auditRepository.create(
    new Types.ObjectId(removedBy),
    AuditAction.REMOVE_PROJECT_MEMBER,
    AuditEntity.PROJECT,
    projectMember.projectId
  );

  return {
    message: 'Project member removed successfully.',
  };
}
}