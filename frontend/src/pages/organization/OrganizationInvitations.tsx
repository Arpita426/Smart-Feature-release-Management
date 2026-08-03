import { useOutletContext } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Mail, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { invitationApi } from '../../lib/resources';
import type { OrganizationInvitation } from '../../types';
import { Badge, Button, EmptyState, ErrorBanner, Field, Input } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { TableToolbar } from '../../components/TableToolbar';
import type { OrgOutletContext } from './OrganizationLayout';

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const;

export default function OrganizationInvitations() {
  const { org } = useOutletContext<OrgOutletContext>();
  const { push } = useToast();
  const [invitations, setInvitations] = useState<OrganizationInvitation[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    invitationApi
      .listForOrganization(org._id)
      .then(setInvitations)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load invitations.'));
  }, [org._id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (invitations ?? []).filter((i) => {
      const matchesQuery = !q || i.email.toLowerCase().includes(q) || i.status.toLowerCase().includes(q);
      const matchesFilter = filter === 'ALL' || i.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [invitations, filter, query]);

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
      <p className="text-sm text-fg-muted mb-4">Invite teammates to collaborate in this organization.</p>
      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search invitations…"
        filterValue={filter}
        onFilterChange={(value) => setFilter(value as (typeof FILTERS)[number])}
        filterOptions={FILTERS.map((value) => ({ label: value.toLowerCase(), value }))}
        filterLabel="Status"
        filterClassName="w-28 py-1 text-xs"
        actions={
          <Button size="sm" onClick={() => setShowForm(true)} disabled={Boolean(loadError)}>
            <Plus className="h-3.5 w-3.5" />
            Invite teammate
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-border bg-surface/70 p-4">
          <p className="text-sm font-medium text-fg">Invitation management is temporarily unavailable.</p>
          <p className="mt-1 text-sm text-fg-muted">The invitation list can’t be loaded right now. Please try again shortly.</p>
        </div>
      )}

      {invitations === null && !loadError ? (
        <TableSkeleton columnsCount={3} rowsCount={4} />
      ) : filtered.length === 0 && !loadError ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" />}
          title={filter === 'ALL' ? 'No invitations yet' : `No ${filter.toLowerCase()} invitations`}
          description={filter === 'ALL' ? 'Invite a teammate to start coordinating releases and access.' : 'There are no invitations in this status right now.'}
          action={
            filter !== 'ALL' ? (
              <Button variant="secondary" onClick={() => setFilter('ALL')}>
                Clear filter
              </Button>
            ) : (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                Invite teammate
              </Button>
            )
          }
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
