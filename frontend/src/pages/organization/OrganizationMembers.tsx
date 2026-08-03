import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/Pagination';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { Avatar, Button, EmptyState, ErrorBanner } from '../../components/ui';
import { TableToolbar } from '../../components/TableToolbar';
import { organizationApi } from '../../lib/resources';
import type { OrganizationRole } from '../../types';
import type { OrgOutletContext } from './OrganizationLayout';

const PAGE_SIZE = 8;

type OrganizationMemberRow = {
  _id: string;
  role: OrganizationRole;
  userId: {
    _id: string;
    fullName?: string;
    email?: string;
  };
};

function memberLabel(member: OrganizationMemberRow) {
  return member.userId.fullName || member.userId.email || member.userId._id;
}

export default function OrganizationMembers() {
  const { org } = useOutletContext<OrgOutletContext>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<OrganizationMemberRow[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'role'>('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    organizationApi
      .listMembers(org._id)
      .then((data) => setMembers(data as OrganizationMemberRow[]))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load members.'));
  }, [org._id]);

  useEffect(() => {
    setPage(1);
  }, [query, sortKey]);

  const filtered = useMemo(() => {
    if (!members) return [];

    const q = query.trim().toLowerCase();
    const filteredMembers = members.filter((member) => {
      if (!q) return true;
      return memberLabel(member).toLowerCase().includes(q);
    });

    return [...filteredMembers].sort((a, b) => {
      if (sortKey === 'role') {
        const roleOrder = (role: OrganizationRole) => ({ OWNER: 0, ADMIN: 1, MEMBER: 2 }[role] ?? 3);
        const roleDiff = roleOrder(a.role) - roleOrder(b.role);
        if (roleDiff !== 0) return roleDiff;
      }

      return memberLabel(a).localeCompare(memberLabel(b));
    });
  }, [members, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<OrganizationMemberRow>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (member) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={memberLabel(member)} size="sm" />
          <div className="min-w-0">
            <p className="text-fg text-sm truncate">{memberLabel(member)}</p>
            <p className="text-fg-subtle text-xs font-mono truncate">{member.userId.email || member.userId._id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => <span className="text-fg-muted text-sm">{member.role}</span>,
    },
  ];

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">Manage user access and roles within this organization.</p>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search members…"
        sortValue={sortKey}
        onSortChange={(value) => setSortKey(value as 'name' | 'role')}
        sortOptions={[
          { label: 'Name', value: 'name' },
          { label: 'Role', value: 'role' },
        ]}
      />

      {loadError && (
        <div className="mb-4">
          <ErrorBanner message={loadError} />
        </div>
      )}

      {members === null && !loadError ? (
        <TableSkeleton columnsCount={2} rowsCount={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={query ? 'No matching members' : 'No members yet'}
          description={query ? 'Try a different search term or clear the filter.' : 'Members for this organization will appear here once they join.'}
          action={
            query ? (
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => navigate(`/app/organizations/${org._id}/invitations`)}>
                Invite teammate
              </Button>
            )
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
