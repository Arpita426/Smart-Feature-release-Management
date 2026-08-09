export type Id = string;

export const SystemRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

export const OrganizationRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const ProjectRole = {
  OWNER: 'OWNER',
  MAINTAINER: 'MAINTAINER',
  DEVELOPER: 'DEVELOPER',
  VIEWER: 'VIEWER',
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const FeatureFlagStatus = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
} as const;
export type FeatureFlagStatus = (typeof FeatureFlagStatus)[keyof typeof FeatureFlagStatus];

export interface User {
  _id: Id;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  systemRole: SystemRole;
  isEmailVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by POST /auth/login
export interface LoginResult {
  token: string;
  user: {
    id: Id;
    fullName: string;
    email: string;
  };
}

// Shape returned by POST /auth/register (no session — user must log in after)
export interface RegisterResult {
  id: Id;
  fullName: string;
  email: string;
  message: string;
}

export interface Organization {
  _id: Id;
  name: string;
  slug: string;
  description?: string;
  createdBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInvitation {
  _id: Id;
  organizationId: Id;
  email: string;
  invitedBy: Id;
  status: InvitationStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: Id;
  name: string;
  slug: string;
  description?: string;
  organizationId: Id;
  createdBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberUser {
  _id: Id;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ProjectMember {
  _id: Id;
  organizationId: Id;
  projectId: Id;
  userId: Id | ProjectMemberUser;
  role: ProjectRole;
  addedBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlag {
  _id: Id;
  name: string;
  key: string;
  description?: string;
  projectId: Id;
  status: FeatureFlagStatus;
  rolloutPercentage: number;
  createdBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  _id: Id;
  projectId: Id;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order: number;
  isSystem: boolean;
  createdBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureConfiguration {
  _id: Id;
  featureId: Id;
  environmentId: Id;
  enabled: boolean;
  rolloutPercentage: number;
  killSwitch: boolean;
  targetingRules?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  updatedBy: Id;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: Id;
  userId: Id | { _id: Id; fullName?: string; email?: string };
  action: string;
  entity: string;
  entityId: Id;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
