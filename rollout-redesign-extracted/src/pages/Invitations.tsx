import { useEffect, useMemo, useState } from 'react';
import { Check, Mail, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { invitationApi } from '../lib/resources';
import type { OrganizationInvitation } from '../types';
import { Badge, Button, EmptyState, ErrorBanner, PageHeader, Skeleton } from '../components/ui';
import { Table, type Column } from '../components/Table';

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const;

export default function Invitations() {
  const { push } = useToast();
  const [invitations, setInvitations] = useState<OrganizationInvitation[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    invitationApi
      .listMine()
      .then(setInvitations)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load invitations.'));
  }, []);

  const filtered = useMemo(
    () => (invitations ?? []).filter((i) => filter === 'ALL' || i.status === filter),
    [invitations, filter]
  );

  async function handleAccept(id: string) {
    setBusyId(id);
    try {
      const updated = await invitationApi.accept(id);
      setInvitations((prev) => (prev ? prev.map((i) => (i._id === id ? updated : i)) : prev));
      push({ tone: 'success', title: 'Invitation accepted' });
    } catch (err) {
      push({ tone: 'danger', title: 'Could not accept invitation', description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      const updated = await invitationApi.reject(id);
      setInvitations((prev) => (prev ? prev.map((i) => (i._id === id ? updated : i)) : prev));
      push({ tone: 'info', title: 'Invitation declined' });
    } catch (err) {
      push({ tone: 'danger', title: 'Could not decline invitation', description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<OrganizationInvitation>[] = [
    {
      key: 'org',
      header: 'Organization',
      render: (inv) => <span className="text-fg-subtle font-mono text-xs">{inv.organizationId}</span>,
    },
    { key: 'status', header: 'Status', render: (inv) => <StatusBadge status={inv.status} /> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-40',
      render: (inv) =>
        inv.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleAccept(inv._id)} disabled={busyId === inv._id}>
              <Check className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleReject(inv._id)} disabled={busyId === inv._id}>
              <X className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Invitations" description="Organizations that have invited you to join." />

      <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-bg-inset mb-4 w-fit">
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

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      {invitations === null && !error ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" />}
          title="No invitations"
          description={filter === 'ALL' ? "You'll see pending invitations here." : `No ${filter.toLowerCase()} invitations.`}
        />
      ) : (
        <Table columns={columns} rows={filtered} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACCEPTED') return <Badge tone="success">Accepted</Badge>;
  if (status === 'REJECTED' || status === 'CANCELLED') return <Badge tone="danger">{status.toLowerCase()}</Badge>;
  return <Badge tone="warning">Pending</Badge>;
}
