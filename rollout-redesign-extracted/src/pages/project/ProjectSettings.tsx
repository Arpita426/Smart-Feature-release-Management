import { useOutletContext } from 'react-router-dom';
import { Card, UnavailableNotice } from '../../components/ui';
import type { ProjectOutletContext } from './ProjectLayout';

export default function ProjectSettings() {
  const { project } = useOutletContext<ProjectOutletContext>();

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="font-display text-sm font-semibold text-fg mb-3">General</h2>
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
          <dt className="text-fg-muted">Name</dt>
          <dd className="text-fg">{project.name}</dd>
          <dt className="text-fg-muted">Slug</dt>
          <dd className="text-fg font-mono">{project.slug}</dd>
          <dt className="text-fg-muted">Description</dt>
          <dd className="text-fg">{project.description || '—'}</dd>
        </dl>
      </Card>

      <UnavailableNotice>
        There's no <code className="font-mono">PATCH /api/v1/projects/:id</code> endpoint yet, so these
        fields are read-only here. Add an update endpoint on the backend to make this tab editable.
      </UnavailableNotice>
    </div>
  );
}
