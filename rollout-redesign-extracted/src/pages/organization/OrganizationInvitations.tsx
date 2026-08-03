import { useOutletContext } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Mail, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { invitationApi } from '../../lib/resources';
import type { OrganizationInvitation } from '../../types';
import { Badge, Button, EmptyState, ErrorBanner, Field, Input, Skeleton } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, type Column } from '../../components/Table';
import type { OrgOutletContext } from './OrganizationLayout';

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const;

export default function OrganizationInvitations() {
  const { org } = useOutletContext<OrgOutletContext>();
  const { push } = useToast();
  const [invitations, setInvitations] = useState<OrganizationInvitation[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    invitationApi
      .listForOrganization(org._id)
      .then(setInvitations)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load invitations.'));
  }, [org._id]);

  const filtered = useMemo(
    () => (invitations ?? []).filter((i) => filter === 'ALL' || i.status === filter),
    [invitations, filter]
  );

  async function handleCancel(invitationId: string) {
    try {
      const updated = await invitationApi.cancel(org._id, invitationId);
      setInvitations((prev) => (prev ? prev.map((inv) => (inv._id === invitationId ? updated : inv)) : prev));
      push({ tone: 'info', title: 'Invitation cancelled' });
    } catch (err) {
      push({ tone: 'danger', title: 'Could not cancel invitation', description: err instanceof Error ? err.message : undefined });
    }
  }

  const columns: Column<OrganizationInvitation>[] = [
    { key: 'email', header: 'Email', render: (i) => <span className="text-fg">{i.email}</span> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'sent',
      header: 'Sent',
      render: (i) => <span className="text-fg-muted">{new Date(i.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-10',
      render: (i) =>
        i.status === 'PENDING' ? (
          <button onClick={() => handleCancel(i._id)} title="Cancel invitation" className="text-fg-subtle hover:text-danger">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-bg-inset">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          Invite teammate
        </Button>
      </div>

      {loadError && (
        <div className="mb-4">
          <ErrorBanner message={loadError} />
          <p className="text-xs text-fg-subtle mt-2">
            This requires the organization-invitation routes to be mounted in{' '}
            <code className="font-mono">app.ts</code> — see README.
          </p>
        </div>
      )}

      {invitations === null && !loadError ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filtered.length === 0 && !loadError ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" />}
          title="No invitations"
          description={filter === 'ALL' ? 'Invite a teammate to get started.' : `No ${filter.toLowerCase()} invitations.`}
        />
      ) : filtered.length > 0 ? (
        <Table columns={columns} rows={filtered} />
      ) : null}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Invite teammate">
        <InviteForm
          organizationId={org._id}
          onSent={(invitation) => {
            setInvitations((prev) => (prev ? [invitation, ...prev] : [invitation]));
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function InviteForm({
  organizationId,
  onSent,
  onCancel,
}: {
  organizationId: string;
  onSent: (invitation: OrganizationInvitation) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const invitation = await invitationApi.send(organizationId, email);
      push({ tone: 'success', title: 'Invitation sent', description: email });
      onSent(invitation);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send invitation.';
      setError(message);
      push({ tone: 'danger', title: 'Could not send invitation', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email">
        <Input
          type="email"
          required
          autoFocus
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send invite'}
        </Button>
      </div>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACCEPTED') return <Badge tone="success">Accepted</Badge>;
  if (status === 'REJECTED' || status === 'CANCELLED') return <Badge tone="danger">{status.toLowerCase()}</Badge>;
  return <Badge tone="warning">Pending</Badge>;
}
