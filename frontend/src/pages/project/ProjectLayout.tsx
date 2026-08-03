import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, FolderKanban } from 'lucide-react';
import { organizationApi, projectApi } from '../../lib/resources';
import type { Organization, Project } from '../../types';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Tabs } from '../../components/Tabs';
import { Button, EmptyState, Skeleton } from '../../components/ui';

export default function ProjectLayout() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!orgId || !projectId) return;
    setProject(undefined);
    organizationApi.getById(orgId).then(setOrg).catch(() => setOrg(null));
    projectApi
      .getById(projectId)
      .then(setProject)
      .catch(() => setProject(null));
  }, [orgId, projectId]);

  if (!orgId || !projectId) return null;

  if (project === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (project === null) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-6 w-6" />}
        title="Project not found"
        description="It may have been removed, or you may not have access to it."
        action={
          <Button onClick={() => navigate(`/app/organizations/${orgId}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to organization
          </Button>
        }
      />
    );
  }

  const base = `/app/organizations/${orgId}/projects/${projectId}`;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/app' },
          { label: org?.name ?? 'Organization', to: `/app/organizations/${orgId}` },
          { label: project.name },
        ]}
      />
      <h1 className="font-display text-xl font-semibold text-fg mt-1 mb-4">{project.name}</h1>

      <Tabs
        items={[
          { label: 'Overview', to: base, end: true },
          { label: 'Feature flags', to: `${base}/feature-flags` },
          { label: 'Members', to: `${base}/members` },
          { label: 'Audit', to: `${base}/audit` },
          { label: 'Settings', to: `${base}/settings` },
        ]}
      />

      <Outlet context={{ org, project, setProject } satisfies ProjectOutletContext} />
    </div>
  );
}

export interface ProjectOutletContext {
  org: Organization | null;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | null | undefined>>;
}
