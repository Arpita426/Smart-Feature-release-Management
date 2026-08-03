import { api, unwrap } from './api';
import type {
  AuditLog,
  FeatureFlag,
  LoginResult,
  Organization,
  OrganizationInvitation,
  Project,
  ProjectMember,
  RegisterResult,
  User,
} from '../types';

// ---------- Auth ----------
export const authApi = {
  register: (input: { fullName: string; email: string; password: string }) =>
    unwrap<RegisterResult>(api.post('/auth/register', input)),

  login: (input: { email: string; password: string }) =>
    unwrap<LoginResult>(api.post('/auth/login', input)),

  profile: () => unwrap<User>(api.get('/auth/profile')),

  lookup: (email: string) =>
    unwrap<{ _id: string; fullName: string; email: string }>(
      api.get('/auth/users/lookup', { params: { email } })
    ),
};

// ---------- Organizations ----------
export const organizationApi = {
  create: (input: { name: string; description?: string }) =>
    unwrap<Organization>(api.post('/organizations', input)),

  list: () => unwrap<Organization[]>(api.get('/organizations')),

  getById: (id: string) => unwrap<Organization>(api.get(`/organizations/${id}`)),

  update: (id: string, input: { name?: string; description?: string }) =>
    unwrap<Organization>(api.patch(`/organizations/${id}`, input)),

  listMembers: (id: string) =>
    unwrap<any[]>(api.get(`/organizations/${id}/members`)),
};

// ---------- Organization invitations ----------
export const invitationApi = {
  send: (organizationId: string, email: string) =>
    unwrap<OrganizationInvitation>(
      api.post(`/organization-invitations/organizations/${organizationId}/invitations`, { email })
    ),

  listForOrganization: (organizationId: string) =>
    unwrap<OrganizationInvitation[]>(
      api.get(`/organization-invitations/organizations/${organizationId}/invitations`)
    ),

  cancel: (organizationId: string, invitationId: string) =>
    unwrap<OrganizationInvitation>(
      api.patch(
        `/organization-invitations/organizations/${organizationId}/invitations/${invitationId}/cancel`
      )
    ),

  listMine: () =>
    unwrap<OrganizationInvitation[]>(api.get('/organization-invitations/users/me/invitations')),

  accept: (invitationId: string) =>
    unwrap<OrganizationInvitation>(
      api.patch(`/organization-invitations/users/me/invitations/${invitationId}/accept`)
    ),

  reject: (invitationId: string) =>
    unwrap<OrganizationInvitation>(
      api.patch(`/organization-invitations/users/me/invitations/${invitationId}/reject`)
    ),
};

// ---------- Projects ----------
export const projectApi = {
  create: (input: { name: string; description?: string; organizationId: string }) =>
    unwrap<Project>(api.post('/projects', input)),

  listByOrganization: (organizationId: string) =>
    unwrap<Project[]>(api.get('/projects', { params: { organizationId } })),

  getById: (id: string) => unwrap<Project>(api.get(`/projects/${id}`)),

  update: (id: string, input: { name?: string; description?: string }) =>
    unwrap<Project>(api.patch(`/projects/${id}`, input)),

  listAudits: (projectId: string) =>
    unwrap<AuditLog[]>(api.get(`/audits/projects/${projectId}`)),
};

// ---------- Project members ----------
export const projectMemberApi = {
  add: (projectId: string, userId: string, role: string) =>
    unwrap<ProjectMember>(api.post(`/project-members/projects/${projectId}/members`, { userId, role })),

  list: (projectId: string) =>
    unwrap<ProjectMember[]>(api.get(`/project-members/projects/${projectId}/members`)),

  changeRole: (projectMemberId: string, role: string) =>
    unwrap<ProjectMember>(api.patch(`/project-members/project-members/${projectMemberId}`, { role })),

  remove: (projectMemberId: string) =>
    unwrap<{ success: boolean }>(api.delete(`/project-members/project-members/${projectMemberId}`)),
};

// ---------- Feature flags ----------
export const featureFlagApi = {
  create: (input: {
    name: string;
    description?: string;
    projectId: string;
    rolloutPercentage?: number;
  }) => unwrap<FeatureFlag>(api.post('/feature-flags', input)),

  listByProject: (projectId: string) =>
    unwrap<FeatureFlag[]>(api.get(`/feature-flags/project/${projectId}`)),

  getById: (id: string) => unwrap<FeatureFlag>(api.get(`/feature-flags/${id}`)),

  toggle: (id: string) => unwrap<FeatureFlag>(api.patch(`/feature-flags/${id}/toggle`)),

  updateRollout: (id: string, rolloutPercentage: number) =>
    unwrap<FeatureFlag>(api.patch(`/feature-flags/${id}/rollout`, { rolloutPercentage })),

  remove: (id: string) => unwrap<{ success: boolean }>(api.delete(`/feature-flags/${id}`)),

  evaluate: (projectId: string, key: string, userId: string) =>
    unwrap<{ enabled: boolean }>(
      api.get('/feature-flags/evaluate', { params: { projectId, key, userId } })
    ),
};
