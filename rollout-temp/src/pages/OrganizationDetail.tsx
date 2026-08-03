import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FolderKanban, Mail, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectApi, invitationApi } from '../lib/resources';
import { cacheProject, getCachedOrgs, getCachedProjects } from '../lib/cache';
import type { Organization, OrganizationInvitation, Project } from '../types';
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

export default function OrganizationDetail() {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    if (!user || !orgId) return;
    const found = getCachedOrgs(user.id).find((o) => o._id === orgId) ?? null;
    setOrg(found);
    setProjects(getCachedProjects(user.id, orgId));
  }, [user, orgId]);

  if (!orgId) return null;

  if (!org) {
    return (
      <EmptyState
        title="Organization not found locally"
        description="This backend doesn't yet have a GET /organizations/:id endpoint, so this app can only show organizations you created or opened in this browser. Go back and open it from the list, or add the endpoint (see README)."
        action={
          <Button onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4" />
            Back to organizations
          </Button>
        }
      />
    );
  }

  function handleProjectCreated(project: Project) {
    if (!user) return;
    cacheProject(user.id, project);
    setProjects(getCachedProjects(user.id, orgId!));
    setShowProjectForm(false);
  }

  return (
    <div>
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper mb-6">
        <ArrowLeft className="h-3.5 w-3.5" />
        Organizations
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-paper">{org.name}</h1>
        <p className="text-faint text-sm font-mono mt-1">{org.slug}</p>
        {org.description && <p className="text-muted text-sm mt-2 max-w-xl">{org.description}</p>}
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-paper">Projects</h2>
          <Button size="sm" onClick={() => setShowProjectForm((s) => !s)}>
            <Plus className="h-3.5 w-3.5" />
            New project
          </Button>
        </div>

        {showProjectForm && (
          <div className="mb-4">
            <CreateProjectForm organizationId={orgId} onCreated={handleProjectCreated} onCancel={() => setShowProjectForm(false)} />
          </div>
        )}

        {projects.length === 0 && !showProjectForm ? (
          <EmptyState
            title="No projects yet"
            description="Create a project to start defining feature flags for it."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="p-4 cursor-pointer hover:border-faint transition-colors group"
                onClick={() => navigate(`/app/organizations/${orgId}/projects/${project._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-md bg-panel-raised border border-line flex items-center justify-center text-amber">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-paper font-medium text-sm">{project.name}</p>
                      <p className="text-faint text-xs font-mono">{project.slug}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-faint group-hover:text-amber transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-base font-semibold text-paper mb-1">Invite a teammate</h2>
        <p className="text-muted text-xs mb-4">
          Requires the organization-invitation routes to be mounted in <code className="font-mono text-faint">app.ts</code> — see README.
        </p>
        <InviteSection organizationId={orgId} />
      </section>
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
      onCreated(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-semibold text-paper mb-4">New project</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mobile App" />
        </Field>
        <Field label="Description (optional)">
          <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        {error && <ErrorBanner message={error} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create project'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function InviteSection({ organizationId }: { organizationId: string }) {
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    invitationApi
      .listForOrganization(organizationId)
      .then(setInvitations)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load invitations.'));
  }, [organizationId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const invitation = await invitationApi.send(organizationId, email);
      setInvitations((prev) => [invitation, ...prev]);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invitation.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(invitationId: string) {
    try {
      const updated = await invitationApi.cancel(organizationId, invitationId);
      setInvitations((prev) => prev.map((inv) => (inv._id === invitationId ? updated : inv)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel invitation.');
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
        <Input
          type="email"
          required
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          <Mail className="h-3.5 w-3.5" />
          {loading ? 'Sending…' : 'Send invite'}
        </Button>
      </form>
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {loadError && <p className="text-xs text-faint mb-4">{loadError}</p>}

      {invitations.length > 0 && (
        <ul className="space-y-2">
          {invitations.map((inv) => (
            <li key={inv._id} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-paper">{inv.email}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={inv.status} />
                {inv.status === 'PENDING' && (
                  <button onClick={() => handleCancel(inv._id)} title="Cancel invitation" className="text-faint hover:text-clay">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACCEPTED') return <Badge tone="success">Accepted</Badge>;
  if (status === 'REJECTED' || status === 'CANCELLED') return <Badge tone="danger">{status.toLowerCase()}</Badge>;
  return <Badge tone="amber">Pending</Badge>;
}
