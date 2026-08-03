import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { featureFlagApi } from '../../lib/resources';
import type { FeatureFlag } from '../../types';
import { Badge, Card, Skeleton } from '../../components/ui';
import type { ProjectOutletContext } from './ProjectLayout';

export default function ProjectOverview() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);

  useEffect(() => {
    featureFlagApi
      .listByProject(project._id)
      .then(setFlags)
      .catch(() => setFlags([]));
  }, [project._id]);

  const enabledCount = flags?.filter((f) => f.status === 'ENABLED').length ?? 0;

  return (
    <div>
      {project.description && <p className="text-fg-muted text-sm mb-6 max-w-xl">{project.description}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted">
            <Flag className="h-4 w-4" />
          </div>
          <div>
            {flags === null ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="font-mono-nums text-xl font-semibold text-fg">{flags.length}</p>
            )}
            <p className="text-xs text-fg-muted">Feature flags</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-success">
            <Flag className="h-4 w-4" />
          </div>
          <div>
            {flags === null ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="font-mono-nums text-xl font-semibold text-fg">{enabledCount}</p>
            )}
            <p className="text-xs text-fg-muted">Enabled now</p>
          </div>
        </Card>
      </div>

      {flags && flags.length > 0 && (
        <Card className="p-4">
          <h2 className="font-display text-sm font-semibold text-fg mb-3">Recently updated flags</h2>
          <div className="space-y-1">
            {[...flags]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((f) => (
                <div key={f._id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-fg font-mono truncate">{f.key}</span>
                  <Badge tone={f.status === 'ENABLED' ? 'success' : 'neutral'}>{f.status}</Badge>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
