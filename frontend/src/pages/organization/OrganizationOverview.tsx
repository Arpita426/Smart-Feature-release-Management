import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FolderKanban, Mail } from 'lucide-react';
import { invitationApi, projectApi } from '../../lib/resources';
import { Card, Skeleton } from '../../components/ui';
import type { OrgOutletContext } from './OrganizationLayout';

export default function OrganizationOverview() {
  const { org } = useOutletContext<OrgOutletContext>();
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    projectApi
      .listByOrganization(org._id)
      .then((projects) => setProjectCount(projects.length))
      .catch(() => setProjectCount(null));
  }, [org._id]);

  useEffect(() => {
    invitationApi
      .listForOrganization(org._id)
      .then((invites) => setPendingCount(invites.filter((i) => i.status === 'PENDING').length))
      .catch(() => setPendingCount(null));
  }, [org._id]);

  return (
    <div>
      {org.description && <p className="text-fg-muted text-sm mb-6 max-w-xl">{org.description}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            {projectCount === null ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="font-mono-nums text-xl font-semibold text-fg">{projectCount}</p>
            )}
            <p className="text-xs text-fg-muted">Projects</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            {pendingCount === null ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="font-mono-nums text-xl font-semibold text-fg">{pendingCount}</p>
            )}
            <p className="text-xs text-fg-muted">Pending invitations</p>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-display text-sm font-semibold text-fg mb-3">Details</h2>
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
          <dt className="text-fg-muted">Slug</dt>
          <dd className="text-fg font-mono">{org.slug}</dd>
          <dt className="text-fg-muted">Created</dt>
          <dd className="text-fg">{new Date(org.createdAt).toLocaleDateString()}</dd>
        </dl>
      </Card>
    </div>
  );
}
