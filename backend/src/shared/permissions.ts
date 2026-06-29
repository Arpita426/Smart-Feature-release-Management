import { OrganizationRole } from '../organization-member/organization-role';

export const OrganizationPermissions = {
  canInviteMembers(role: OrganizationRole) {
    return (
      role === OrganizationRole.OWNER ||
      role === OrganizationRole.ADMIN
    );
  },

  canManageProjects(role: OrganizationRole) {
    return (
      role === OrganizationRole.OWNER ||
      role === OrganizationRole.ADMIN
    );
  },

  canManageFeatureFlags(role: OrganizationRole) {
    return (
      role === OrganizationRole.OWNER ||
      role === OrganizationRole.ADMIN
    );
  },

  canDeleteOrganization(role: OrganizationRole) {
    return role === OrganizationRole.OWNER;
  },
};