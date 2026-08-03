import { useEffect, useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Pagination } from '../../components/Pagination';
import { Badge, Button, EmptyState, ErrorBanner } from '../../components/ui';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { TableToolbar } from '../../components/TableToolbar';
import { projectApi } from '../../lib/resources';
import type { AuditLog } from '../../types';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

function formatAction(action: string) {
  const label = action.replace(/_/g, ' ').toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getUserLabel(userId: AuditLog['userId']) {
  if (typeof userId === 'string') return userId;
  if (userId?.fullName) return userId.fullName;
  if (userId?.email) return userId.email;
  return 'Unknown user';
}

export default function ProjectAudit() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    projectApi
      .listAudits(project._id)
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load audit logs.'));
  }, [project._id]);

  useEffect(() => {
    setPage(1);
  }, [query, actionFilter]);

  const actionOptions = useMemo(() => {
    if (!logs) return [];
    return Array.from(new Set(logs.map((log) => log.action))).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    if (!logs) return [];

    const q = query.trim().toLowerCase();

    return logs.filter((log) => {
      const haystack = [log.action, log.entity, getUserLabel(log.userId)].join(' ').toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      return matchesQuery && matchesAction;
    });
  }, [logs, query, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (log) => (
        <div className="min-w-0">
          <Badge tone="brand">{formatAction(log.action)}</Badge>
          <p className="text-fg-subtle text-xs mt-1">{log.entity}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (log) => <span className="text-fg text-sm">{getUserLabel(log.userId)}</span>,
    },
    {
      key: 'date',
      header: 'Time',
      render: (log) => <span className="text-fg-muted text-sm">{new Date(log.createdAt).toLocaleString()}</span>,
    },
  ];

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">Recent project activity and feature-flag changes.</p>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search audit events…"
        filterValue={actionFilter}
        onFilterChange={setActionFilter}
        filterOptions={[{ label: 'All actions', value: 'all' }, ...actionOptions.map((action) => ({ label: formatAction(action), value: action }))]}
        filterLabel="Filter"
        filterClassName="w-40 py-1 text-xs"
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {logs === null && !error ? (
        <TableSkeleton columnsCount={3} rowsCount={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title={query || actionFilter !== 'all' ? 'No matching audit events' : 'No audit events yet'}
          description={query || actionFilter !== 'all' ? 'Try a different search term or clear the active filter.' : 'Project activity will appear here as flags, members, and settings change.'}
          action={
            query || actionFilter !== 'all' ? (
              <Button variant="secondary" onClick={() => { setQuery(''); setActionFilter('all'); }}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table columns={columns} rows={pageRows} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
