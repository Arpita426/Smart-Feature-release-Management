import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, FolderKanban, Mail, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { organizationApi, projectApi, invitationApi } from '../lib/resources';
import type { Organization } from '../types';
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
} from '../components/ui';
import { Modal } from '../components/Modal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [pendingInvites, setPendingInvites] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    organizationApi
      .list()
      .then((list) => {
        setOrgs(list);
        Promise.all(list.map((o) => projectApi.listByOrganization(o._id)))
          .then((results) => setProjectCount(results.reduce((sum, r) => sum + r.length, 0)))
          .catch(() => setProjectCount(null));
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load organizations.'));
  }, []);

  useEffect(() => {
    invitationApi
      .listMine()
      .then((invites) => setPendingInvites(invites.filter((i) => i.status === 'PENDING').length))
      .catch(() => setPendingInvites(null));
  }, []);

  function handleCreated(org: Organization) {
    setOrgs((prev) => (prev ? [org, ...prev] : [org]));
    setShowForm(false);
    navigate(`/app/organizations/${org._id}`);
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your organizations, projects, and pending invites."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            New organization
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Organizations" value={orgs?.length ?? null} />
        <StatCard icon={<FolderKanban className="h-4 w-4" />} label="Projects" value={projectCount} />
        <StatCard
          icon={<Mail className="h-4 w-4" />}
          label="Pending invitations"
          value={pendingInvites}
          onClick={() => navigate('/app/invitations')}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold text-fg">Organizations</h2>
      </div>

      {loadError && (
        <div className="mb-4">
          <ErrorBanner message={loadError} />
        </div>
      )}

      {orgs === null && !loadError ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : orgs && orgs.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No organizations yet"
          description="Create an organization to start grouping projects and managing feature flags for your team."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              New organization
            </Button>
          }
        />
      ) : orgs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {orgs.map((org) => (
            <Card
              key={org._id}
              className="p-4 cursor-pointer hover:border-border-strong transition-colors group"
              onClick={() => navigate(`/app/organizations/${org._id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-bg-inset border border-border flex items-center justify-center text-brand shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-fg font-medium text-sm truncate">{org.name}</p>
                    <p className="text-fg-subtle text-xs font-mono truncate">{org.slug}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-fg-subtle group-hover:text-brand transition-colors shrink-0" />
              </div>
              {org.description && (
                <p className="text-fg-muted text-sm mt-3 line-clamp-2">{org.description}</p>
              )}
            </Card>
          ))}
        </div>
      ) : null}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New organization">
        <CreateOrgForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:border-border-strong transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
        {icon}
      </div>
      <div>
        {value === null ? (
          <Skeleton className="h-6 w-8" />
        ) : (
          <p className="font-mono-nums text-xl font-semibold text-fg">{value}</p>
        )}
        <p className="text-xs text-fg-muted">{label}</p>
      </div>
    </Card>
  );
}

function CreateOrgForm({
  onCreated,
  onCancel,
}: {
  onCreated: (org: Organization) => void;
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
      const org = await organizationApi.create({ name, description: description || undefined });
      push({ tone: 'success', title: 'Organization created', description: org.name });
      onCreated(org);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create organization.';
      setError(message);
      push({ tone: 'danger', title: 'Could not create organization', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus />
      </Field>
      <Field label="Description (optional)">
        <Textarea
          rows={2}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this organization work on?"
        />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create organization'}
        </Button>
      </div>
    </form>
  );
}
