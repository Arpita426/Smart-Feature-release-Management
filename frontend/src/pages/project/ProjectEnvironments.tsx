import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Layers3 } from 'lucide-react';
import type { Environment } from '../../types';
import { environmentApi } from '../../lib/resources';
import { Badge, Button, EmptyState, ErrorBanner, Field, Input, Textarea } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { Table, TableSkeleton, type Column } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { TableToolbar } from '../../components/TableToolbar';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

export default function ProjectEnvironments() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const [environments, setEnvironments] = useState<Environment[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    environmentApi
      .listByProject(project._id)
      .then(setEnvironments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load environments.'));
  }, [project._id]);

  const filtered = useMemo(() => {
    if (!environments) return [];
    const q = query.trim().toLowerCase();
    if (!q) return environments;
    return environments.filter((environment) => environment.name.toLowerCase().includes(q) || environment.slug.toLowerCase().includes(q));
  }, [environments, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCreated(environment: Environment) {
    setEnvironments((prev) => (prev ? [environment, ...prev] : [environment]));
    setShowForm(false);
  }

  const columns: Column<Environment>[] = [
    {
      key: 'name',
      header: 'Environment',
      render: (environment) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: environment.color || '#2563eb' }} />
            <p className="text-fg font-medium truncate">{environment.name}</p>
          </div>
          <p className="text-fg-subtle text-xs font-mono truncate">{environment.slug}</p>
        </div>
      ),
    },
    {
      key: 'default',
      header: 'Default',
      render: (environment) => <Badge tone={environment.isDefault ? 'success' : 'neutral'}>{environment.isDefault ? 'Default' : 'Optional'}</Badge>,
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (environment) => <span className="text-fg-muted">{new Date(environment.updatedAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">Create and manage environment-specific rollout settings for this project.</p>
      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search environments…"
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            New environment
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {environments === null && !error ? (
        <TableSkeleton columnsCount={3} rowsCount={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Layers3 className="h-6 w-6" />}
          title={query ? 'No matching environments' : 'No environments yet'}
          description={query ? 'Try a different search term or clear the filter.' : 'Create environments to support development, staging, and production rollouts.'}
          action={
            query ? (
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                New environment
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

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New environment">
        <CreateEnvironmentForm projectId={project._id} onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function CreateEnvironmentForm({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: string;
  onCreated: (environment: Environment) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [order, setOrder] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const environment = await environmentApi.create(projectId, { name, description: description || undefined, color, order, isDefault });
      onCreated(environment);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create environment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="QA" autoFocus />
      </Field>
      <Field label="Description (optional)">
        <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Used for regression testing" />
      </Field>
      <Field label="Color">
        <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </Field>
      <Field label="Display order">
        <Input type="number" min={0} max={1000} value={order} onChange={(e) => setOrder(Number(e.target.value))} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-fg-muted">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Set as default environment
      </label>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create environment'}
        </Button>
      </div>
    </form>
  );
}
