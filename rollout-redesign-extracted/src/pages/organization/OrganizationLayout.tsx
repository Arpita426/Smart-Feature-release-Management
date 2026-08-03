import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { organizationApi } from '../../lib/resources';
import type { Organization } from '../../types';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Tabs } from '../../components/Tabs';
import { Button, EmptyState, Skeleton } from '../../components/ui';

export default function OrganizationLayout() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null | undefined>(undefined);

  useEffect(() => {
    if (!orgId) return;
    setOrg(undefined);
    organizationApi
      .getById(orgId)
      .then(setOrg)
      .catch(() => setOrg(null));
  }, [orgId]);

  if (!orgId) return null;

  if (org === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (org === null) {
    return (
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Organization not found"
        description="It may have been removed, or you may not have access to it."
        action={
          <Button onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        }
      />
    );
  }

  const base = `/app/organizations/${orgId}`;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/app' }, { label: org.name }]} />
      <h1 className="font-display text-xl font-semibold text-fg mt-1 mb-4">{org.name}</h1>

      <Tabs
        items={[
          { label: 'Overview', to: base, end: true },
          { label: 'Projects', to: `${base}/projects` },
          { label: 'Members', to: `${base}/members` },
          { label: 'Invitations', to: `${base}/invitations` },
          { label: 'Settings', to: `${base}/settings` },
        ]}
      />

      <Outlet context={{ org } satisfies OrgOutletContext} />
    </div>
  );
}

export interface OrgOutletContext {
  org: Organization;
}
