import { useOutletContext } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { authApi, projectMemberApi } from '../../lib/resources';
import type { ProjectMember } from '../../types';
import { ProjectRole } from '../../types';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  Select,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { TableToolbar } from '../../components/TableToolbar';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

/** userId can come back as a raw string or a populated user object — normalize once. */
function memberIdentity(member: ProjectMember): { label: string; isName: boolean } {
  const { userId } = member;
  if (typeof userId === 'string') return { label: userId, isName: false };
  return { label: userId.fullName || userId.email || userId._id, isName: Boolean(userId.fullName) };
}

export default function ProjectMembers() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const { push } = useToast();
  const [members, setMembers] = useState<ProjectMember[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'role'>('name');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    projectMemberApi
      .list(project._id)
      .then(setMembers)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load members.'));
  }, [project._id]);

  useEffect(() => {
    setPage(1);
  }, [query, sortKey]);

  const filtered = useMemo(() => {
    if (!members) return [];

    const q = query.trim().toLowerCase();
    const normalizedMembers = members.filter((member) => {
      if (!q) return true;
      return memberIdentity(member).label.toLowerCase().includes(q);
    });

    return [...normalizedMembers].sort((a, b) => {
      if (sortKey === 'role') {
        const roleOrder = (role: ProjectRole) => ({ OWNER: 0, MAINTAINER: 1, DEVELOPER: 2, VIEWER: 3 }[role] ?? 4);
        const roleDiff = roleOrder(a.role) - roleOrder(b.role);
        if (roleDiff !== 0) return roleDiff;
      }

      const left = memberIdentity(a).label.toLowerCase();
      const right = memberIdentity(b).label.toLowerCase();
      return left.localeCompare(right);
    });
  }, [members, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleRemove(member: ProjectMember) {
    try {
      await projectMemberApi.remove(member._id);
      setMembers((prev) => (prev ? prev.filter((m) => m._id !== member._id) : prev));
      push({ tone: 'info', title: 'Member removed' });
    } catch (err) {
      push({ tone: 'danger', title: 'Could not remove member', description: err instanceof Error ? err.message : undefined });
    }
  }

  async function handleRoleChange(member: ProjectMember, role: ProjectRole) {
    try {
      const updated = await projectMemberApi.changeRole(member._id, role);
      setMembers((prev) => (prev ? prev.map((m) => (m._id === member._id ? updated : m)) : prev));
      push({ tone: 'success', title: 'Role updated' });
    } catch (err) {
      push({ tone: 'danger', title: 'Could not update role', description: err instanceof Error ? err.message : undefined });
    }
  }

  const columns: Column<ProjectMember>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (m) => {
        const identity = memberIdentity(m);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={identity.label} size="sm" />
            <span className={identity.isName ? 'text-fg text-sm truncate' : 'font-mono text-xs text-fg truncate'}>
              {identity.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      render: (m) => (
        <Select aria-label={`Role for ${memberIdentity(m).label}`} value={m.role} onChange={(e) => handleRoleChange(m, e.target.value as ProjectRole)} className="text-xs py-1">
          {Object.values(ProjectRole).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-16',
      render: (m) => (
        <button type="button" onClick={() => handleRemove(m)} className="text-xs text-fg-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">Teammates assigned to this project and their roles.</p>
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
        actions={
          <Button size="sm" onClick={() => setShowForm(true)} disabled={Boolean(loadError)}>
            <UserPlus className="h-3.5 w-3.5" />
            Add member
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-border bg-surface/70 p-4">
          <p className="text-sm font-medium text-fg">Member management is temporarily unavailable.</p>
          <p className="mt-1 text-sm text-fg-muted">The member list can’t be loaded right now. Please try again shortly.</p>
        </div>
      )}

      {members === null && !loadError ? (
        <TableSkeleton columnsCount={3} rowsCount={5} />
      ) : filtered.length === 0 && !loadError ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={query ? 'No matching members' : 'No members yet'}
          description={query ? 'Try a different search term or clear the filter.' : 'Add teammates to this project so they can contribute to rollout work.'}
          action={
            query ? (
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setShowForm(true)}>
                <UserPlus className="h-3.5 w-3.5" />
                Add member
              </Button>
            )
          }
        />
      ) : filtered.length > 0 ? (
        <>
          <Table columns={columns} rows={pageRows} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : null}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add member">
        <AddMemberForm
          projectId={project._id}
          existingMemberIds={members?.map((member) => {
            if (typeof member.userId === 'string') return member.userId;
            return member.userId._id;
          }) ?? []}
          onAdded={(member) => {
            setMembers((prev) => (prev ? [member, ...prev] : [member]));
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function AddMemberForm({
  projectId,
  existingMemberIds,
  onAdded,
  onCancel,
}: {
  projectId: string;
  existingMemberIds: string[];
  onAdded: (member: ProjectMember) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ _id: string; fullName: string; email: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<{ _id: string; fullName: string; email: string } | null>(null);
  const [role, setRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || trimmed.includes('@') === false) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }

    const timer = window.setTimeout(() => {
      authApi
        .lookup(trimmed)
        .then((result) => {
          setSuggestions([result]);
          setSelectedUser(result);
        })
        .catch(() => {
          setSuggestions([]);
          setSelectedUser(null);
        });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [email]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Enter a valid email to find a user.');
      return;
    }

    if (existingMemberIds.includes(selectedUser._id)) {
      setError('This user is already a member of this project.');
      return;
    }

    setLoading(true);
    try {
      const member = await projectMemberApi.add(projectId, selectedUser._id, role);
      push({ tone: 'success', title: 'Member added' });
      onAdded(member);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not add member.';
      setError(message);
      push({ tone: 'danger', title: 'Could not add member', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email">
        <div className="relative">
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            autoFocus
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-sm overflow-hidden">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion._id}
                  type="button"
                  className="flex w-full items-center justify-between px-2.5 py-2 text-left text-sm hover:bg-surface-hover focus-visible:bg-surface-hover"
                  onClick={() => {
                    setEmail(suggestion.email);
                    setSelectedUser(suggestion);
                    setSuggestions([]);
                  }}
                >
                  <span className="text-fg">{suggestion.fullName || suggestion.email}</span>
                  <span className="text-fg-subtle font-mono text-xs">{suggestion.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>
      <Field label="Role">
        <Select aria-label="Project role" value={role} onChange={(e) => setRole(e.target.value as ProjectRole)} className="w-full">
          {Object.values(ProjectRole).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !selectedUser}>
          {loading ? 'Adding…' : 'Add member'}
        </Button>
      </div>
    </form>
  );
}
