import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Flag, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { featureFlagApi } from '../../lib/resources';
import type { FeatureFlag } from '../../types';
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  SearchInput,
  Skeleton,
  Textarea,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, type Column } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

export default function ProjectFeatureFlags() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const navigate = useNavigate();
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    featureFlagApi
      .listByProject(project._id)
      .then(setFlags)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load feature flags.'));
  }, [project._id]);

  const filtered = useMemo(() => {
    if (!flags) return [];
    const q = query.trim().toLowerCase();
    if (!q) return flags;
    return flags.filter((f) => f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
  }, [flags, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCreated(flag: FeatureFlag) {
    setFlags((prev) => (prev ? [flag, ...prev] : [flag]));
    setShowForm(false);
  }

  const columns: Column<FeatureFlag>[] = [
    {
      key: 'name',
      header: 'Flag name',
      render: (f) => (
        <div className="min-w-0">
          <p className="text-fg font-medium truncate">{f.name}</p>
          <p className="text-fg-subtle text-xs font-mono truncate">{f.key}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (f) => <Badge tone={f.status === 'ENABLED' ? 'success' : 'neutral'}>{f.status}</Badge>,
    },
    {
      key: 'rollout',
      header: 'Rollout',
      render: (f) => (
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-1.5 rounded-full bg-bg-inset overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{ width: `${f.rolloutPercentage}%` }} />
          </div>
          <span className="font-mono-nums text-xs text-fg-muted w-8 text-right">{f.rolloutPercentage}%</span>
        </div>
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (f) => <span className="text-fg-muted">{new Date(f.updatedAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Search flags…" className="w-64" />
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          New flag
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {flags === null && !error ? (
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-6 w-6" />}
          title={query ? 'No matching flags' : 'No feature flags yet'}
          description={query ? 'Try a different search term.' : 'Create a flag to start a gradual rollout.'}
        />
      ) : (
        <>
          <Table columns={columns} rows={pageRows} onRowClick={(f) => navigate(`/app/feature-flags/${f._id}`)} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New feature flag">
        <CreateFlagForm projectId={project._id} onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>
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
  const { push } = useToast();
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
      push({ tone: 'success', title: 'Feature flag created', description: flag.name });
      onCreated(flag);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create feature flag.';
      setError(message);
      push({ tone: 'danger', title: 'Could not create flag', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="New checkout flow" autoFocus />
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
          className="w-full accent-brand"
        />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create flag'}
        </Button>
      </div>
    </form>
  );
}
