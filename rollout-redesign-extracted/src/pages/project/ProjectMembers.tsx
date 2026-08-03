import { useOutletContext } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { projectMemberApi } from '../../lib/resources';
import type { ProjectMember } from '../../types';
import { ProjectRole } from '../../types';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  SearchInput,
  Select,
  Skeleton,
  UnavailableNotice,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, type Column } from '../../components/Table';
import type { ProjectOutletContext } from './ProjectLayout';

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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    projectMemberApi
      .list(project._id)
      .then(setMembers)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load members.'));
  }, [project._id]);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => memberIdentity(m).label.toLowerCase().includes(q));
  }, [members, query]);

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
        <Select value={m.role} onChange={(e) => handleRoleChange(m, e.target.value as ProjectRole)} className="text-xs py-1">
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
        <button onClick={() => handleRemove(m)} className="text-xs text-fg-subtle hover:text-danger">
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by user id…" className="w-64" />
        <Button size="sm" onClick={() => setShowForm(true)}>
          <UserPlus className="h-3.5 w-3.5" />
          Add member
        </Button>
      </div>

      {loadError && (
        <div className="mb-4">
          <ErrorBanner message={loadError} />
          <p className="text-xs text-fg-subtle mt-2">
            This requires the project-member routes to be mounted in <code className="font-mono">app.ts</code> — see README.
          </p>
        </div>
      )}

      {members === null && !loadError ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : filtered.length === 0 && !loadError ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No members yet" description="Add a teammate by their user ID." />
      ) : filtered.length > 0 ? (
        <Table columns={columns} rows={filtered} />
      ) : null}

      <UnavailableNotice>
        There's no user-search endpoint on the backend, so members are added by pasting a raw user ID below.
        Consider adding a lookup-by-email endpoint to make this friendlier.
      </UnavailableNotice>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add member">
        <AddMemberForm
          projectId={project._id}
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
  onAdded,
  onCancel,
}: {
  projectId: string;
  onAdded: (member: ProjectMember) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const member = await projectMemberApi.add(projectId, userId, role);
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
      <Field label="User ID">
        <Input required value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Mongo user id" className="font-mono" autoFocus />
      </Field>
      <Field label="Role">
        <Select value={role} onChange={(e) => setRole(e.target.value as ProjectRole)} className="w-full">
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add member'}
        </Button>
      </div>
    </form>
  );
}
