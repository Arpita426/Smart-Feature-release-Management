import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Flag, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { environmentApi, featureConfigurationApi, featureFlagApi } from '../../lib/resources';
import type { Environment, FeatureConfiguration, FeatureFlag } from '../../types';
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  Textarea,
} from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { TableToolbar } from '../../components/TableToolbar';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

export default function ProjectFeatureFlags() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [configurations, setConfigurations] = useState<Record<string, FeatureConfiguration | null>>({});
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);

  useEffect(() => {
    featureFlagApi
      .listByProject(project._id)
      .then(setFlags)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load feature flags.'));

    environmentApi
      .listByProject(project._id)
      .then((result) => {
        setEnvironments(result);
        const requestedEnvironmentId = searchParams.get('environmentId');
        const fallbackEnvironment = result.find((item) => item._id === requestedEnvironmentId) ?? result[0];
        if (fallbackEnvironment) {
          setSelectedEnvironmentId(fallbackEnvironment._id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load environments.'));
  }, [project._id]);

  useEffect(() => {
    if (!selectedEnvironmentId || !flags?.length) {
      setConfigurations({});
      return;
    }

    let isMounted = true;
    Promise.all(
      flags.map(async (flag) => {
        try {
          const config = await featureConfigurationApi.getByEnvironment(flag._id, selectedEnvironmentId);
          return [flag._id, config] as const;
        } catch {
          return [flag._id, null] as const;
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      const next: Record<string, FeatureConfiguration | null> = {};
      results.forEach(([flagId, config]) => {
        next[flagId] = config;
      });
      setConfigurations(next);
    });

    return () => {
      isMounted = false;
    };
  }, [flags, selectedEnvironmentId]);

  const filtered = useMemo(() => {
    if (!flags) return [];
    const q = query.trim().toLowerCase();
    if (!q) return flags;
    return flags.filter((f) => f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
  }, [flags, query]);

  const selectedEnvironment = environments.find((environment) => environment._id === selectedEnvironmentId) ?? environments[0] ?? null;

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
      key: 'environment',
      header: 'Environment config',
      render: (f) => {
        const config = configurations[f._id];
        return (
          <div className="flex flex-col gap-1">
            <Badge tone={config?.enabled ? 'success' : 'neutral'}>{config?.enabled ? 'Enabled' : 'Disabled'}</Badge>
            <span className="text-xs text-fg-muted">{config?.rolloutPercentage ?? f.rolloutPercentage}% rollout</span>
          </div>
        );
      },
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (f) => <span className="text-fg-muted">{new Date(f.updatedAt).toLocaleDateString()}</span>,
    },
  ];

  function handleEnvironmentChange(environment: Environment) {
    setSelectedEnvironmentId(environment._id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('environmentId', environment._id);
      return next;
    });
  }

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">Control gradual rollout and targeting of feature releases.</p>
      {environments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {environments.map((environment) => (
            <button
              key={environment._id}
              type="button"
              onClick={() => handleEnvironmentChange(environment)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${selectedEnvironment?._id === environment._id ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-surface text-fg-muted hover:bg-surface-hover'}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: environment.color || '#2563eb' }} />
              {environment.name}
            </button>
          ))}
        </div>
      )}
      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search flags…"
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            New flag
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {flags === null && !error ? (
        <TableSkeleton columnsCount={3} rowsCount={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-6 w-6" />}
          title={query ? 'No matching flags' : 'No feature flags yet'}
          description={query ? 'Try a different search term or clear the filter.' : 'Create a flag to start a gradual rollout for this project.'}
          action={
            query ? (
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                New flag
              </Button>
            )
          }
        />
      ) : (
        <>
          {selectedEnvironment && (
            <div className="mb-4 rounded-lg border border-border bg-bg-inset/40 px-3 py-2 text-sm text-fg-muted">
              Showing feature flag configuration for <span className="font-medium text-fg">{selectedEnvironment.name}</span>.
            </div>
          )}
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
        <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this feature flag for?" />
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
