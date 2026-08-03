import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flag, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { featureFlagApi, projectMemberApi } from '../lib/resources';
import { getCachedProjects } from '../lib/cache';
import type { FeatureFlag, Project, ProjectMember } from '../types';
import { ProjectRole } from '../types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  Textarea,
} from '../components/ui';


export default function ProjectDetail() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsError, setFlagsError] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);

  useEffect(() => {
    if (!user || !orgId || !projectId) return;
    const found = getCachedProjects(user.id, orgId).find((p) => p._id === projectId) ?? null;
    setProject(found);
  }, [user, orgId, projectId]);

  useEffect(() => {
    if (!projectId) return;
    featureFlagApi
      .listByProject(projectId)
      .then(setFlags)
      .catch((err) => setFlagsError(err instanceof Error ? err.message : 'Could not load feature flags.'));
  }, [projectId]);

  if (!orgId || !projectId) return null;

  if (!project) {
    return (
      <EmptyState
        title="Project not found locally"
        description="This backend doesn't yet have a GET /projects/:id endpoint, so this app can only show projects you created or opened in this browser. Open it from its organization page instead."
        action={
          <Button onClick={() => navigate(`/app/organizations/${orgId}`)}>
            <ArrowLeft className="h-4 w-4" />
            Back to organization
          </Button>
        }
      />
    );
  }

  function handleFlagCreated(flag: FeatureFlag) {
    setFlags((prev) => [flag, ...prev]);
    setShowFlagForm(false);
  }

  return (
    <div>
      <Link
        to={`/app/organizations/${orgId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-paper">{project.name}</h1>
        <p className="text-faint text-sm font-mono mt-1">{project.slug}</p>
        {project.description && <p className="text-muted text-sm mt-2 max-w-xl">{project.description}</p>}
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-paper">Feature flags</h2>
          <Button size="sm" onClick={() => setShowFlagForm((s) => !s)}>
            <Plus className="h-3.5 w-3.5" />
            New flag
          </Button>
        </div>

        {showFlagForm && (
          <div className="mb-4">
            <CreateFlagForm projectId={projectId} onCreated={handleFlagCreated} onCancel={() => setShowFlagForm(false)} />
          </div>
        )}

        {flagsError && <div className="mb-4"><ErrorBanner message={flagsError} /></div>}

        {flags.length === 0 && !showFlagForm ? (
          <EmptyState title="No feature flags yet" description="Create a flag to start a gradual rollout." />
        ) : (
          <div className="space-y-2">
            {flags.map((flag) => (
              <Card
                key={flag._id}
                className="p-4 cursor-pointer hover:border-faint transition-colors"
                onClick={() => navigate(`/app/feature-flags/${flag._id}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Flag className="h-4 w-4 text-amber shrink-0" />
                    <div className="min-w-0">
                      <p className="text-paper font-medium text-sm truncate">{flag.name}</p>
                      <p className="text-faint text-xs font-mono truncate">{flag.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono-nums text-sm text-muted w-10 text-right">
                      {flag.rolloutPercentage}%
                    </span>
                    <Badge tone={flag.status === 'ENABLED' ? 'success' : 'neutral'}>{flag.status}</Badge>
                    <ArrowRight className="h-4 w-4 text-faint" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-base font-semibold text-paper mb-1">Members</h2>
        <p className="text-muted text-xs mb-4">
          Requires the project-member routes to be mounted in <code className="font-mono text-faint">app.ts</code> — see README.
        </p>
        <MembersSection projectId={projectId} />
      </section>
    </div>
  );
}

function CreateFlagForm({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: string;
  onCreated: (flag: FeatureFlag) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rolloutPercentage, setRolloutPercentage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const flag = await featureFlagApi.create({
        name,
        description: description || undefined,
        projectId,
        rolloutPercentage,
      });
      onCreated(flag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create feature flag.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-semibold text-paper mb-4">New feature flag</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="New checkout flow" />
        </Field>
        <Field label="Description (optional)">
          <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label={`Initial rollout — ${rolloutPercentage}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={rolloutPercentage}
            onChange={(e) => setRolloutPercentage(Number(e.target.value))}
            className="w-full accent-amber"
          />
        </Field>
        {error && <ErrorBanner message={error} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create flag'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MembersSection({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadError, setLoadError] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    projectMemberApi
      .list(projectId)
      .then(setMembers)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load members.'));
  }, [projectId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const member = await projectMemberApi.add(projectId, userId, role);
      setMembers((prev) => [member, ...prev]);
      setUserId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add member.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(projectMemberId: string) {
    try {
      await projectMemberApi.remove(projectMemberId);
      setMembers((prev) => prev.filter((m) => m._id !== projectMemberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member.');
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <Input
          required
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="font-mono"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as ProjectRole)}
          className="rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper focus:border-amber outline-none"
        >
          {Object.values(ProjectRole).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={loading} className="shrink-0">
          <UserPlus className="h-3.5 w-3.5" />
          Add
        </Button>
      </form>
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {loadError && <p className="text-xs text-faint mb-4">{loadError}</p>}

      {members.length > 0 && (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m._id} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-paper font-mono text-xs">{m.userId}</span>
              <div className="flex items-center gap-2">
                <Badge>{m.role}</Badge>
                <button onClick={() => handleRemove(m._id)} className="text-faint hover:text-clay text-xs">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
