import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, FolderKanban, Plus, Flag, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { projectApi, featureFlagApi, projectMemberApi } from '../../lib/resources';
import type { Project } from '../../types';
import { Button, Card, EmptyState, ErrorBanner, Field, Input, Skeleton, Textarea } from '../../components/ui';
import { Modal } from '../../components/Modal';
import type { OrgOutletContext } from './OrganizationLayout';

export default function OrganizationProjects() {
  const { org } = useOutletContext<OrgOutletContext>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [projectStats, setProjectStats] = useState<Record<string, { flagCount: number; memberCount: number }>>({});

  useEffect(() => {
    projectApi
      .listByOrganization(org._id)
      .then(async (data) => {
        setProjects(data);
        const [flagResults, memberResults] = await Promise.all([
          Promise.allSettled(data.map((p) => featureFlagApi.listByProject(p._id))),
          Promise.allSettled(data.map((p) => projectMemberApi.list(p._id))),
        ]);
        const stats: Record<string, { flagCount: number; memberCount: number }> = {};
        data.forEach((p, idx) => {
          const flags = flagResults[idx].status === 'fulfilled' ? flagResults[idx].value : [];
          const members = memberResults[idx].status === 'fulfilled' ? memberResults[idx].value : [];
          stats[p._id] = { flagCount: flags.length, memberCount: members.length };
        });
        setProjectStats(stats);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load projects.'));
  }, [org._id]);

  function handleCreated(project: Project) {
    setProjects((prev) => (prev ? [project, ...prev] : [project]));
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-fg-muted">Projects group feature flags for a specific codebase or product.</p>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          New project
        </Button>
      </div>

      {loadError && (
        <div className="mb-4">
          <ErrorBanner message={loadError} />
        </div>
      )}

      {projects === null && !loadError ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : projects && projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects yet"
          description="Create a project to group feature flags, releases, and rollout plans for a specific product."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              New project
            </Button>
          }
        />
      ) : projects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="p-4 cursor-pointer hover:border-brand/40 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              onClick={() => navigate(`/app/organizations/${org._id}/projects/${project._id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/app/organizations/${org._id}/projects/${project._id}`);
                }
              }}
              tabIndex={0}
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-bg-inset border border-border flex items-center justify-center text-brand shrink-0 group-hover:text-brand-strong transition-colors">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-fg font-medium text-sm truncate group-hover:text-brand transition-colors">{project.name}</p>
                      <p className="text-fg-subtle text-xs font-mono truncate">{project.slug}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-fg-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                {project.description && (
                  <p className="text-fg-muted text-xs mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50 text-[10px] text-fg-subtle">
                <span className="flex items-center gap-1 font-mono">
                  <Flag className="h-3 w-3 text-fg-subtle" />
                  {projectStats[project._id]?.flagCount ?? 0} flags
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Users className="h-3 w-3 text-fg-subtle" />
                  {projectStats[project._id]?.memberCount ?? 0} members
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New project">
        <CreateProjectForm organizationId={org._id} onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function CreateProjectForm({
  organizationId,
  onCreated,
  onCancel,
}: {
  organizationId: string;
  onCreated: (project: Project) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const project = await projectApi.create({ name, description: description || undefined, organizationId });
      push({ tone: 'success', title: 'Project created', description: project.name });
      onCreated(project);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create project.';
      setError(message);
      push({ tone: 'danger', title: 'Could not create project', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mobile App" autoFocus />
      </Field>
      <Field label="Description (optional)">
        <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this project focus on?" />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}
