import { Users } from 'lucide-react';
import { UnavailableNotice } from '../../components/ui';

export default function OrganizationMembers() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-fg-muted">
        <Users className="h-4 w-4" />
        <p className="text-sm">Organization-wide members</p>
      </div>
      <UnavailableNotice>
        The backend has an <code className="font-mono">organization-member</code> model and service, but no
        HTTP route exposes a member list yet (only <code className="font-mono">project-member</code> routes
        are wired up). Add a <code className="font-mono">GET /api/v1/organizations/:id/members</code> endpoint
        to power this tab — see the README for details. In the meantime, manage members at the project level
        from a project's Members tab.
      </UnavailableNotice>
    </div>
  );
}
