import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Layers3, GripVertical, PencilLine, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { Environment } from '../../types';
import { environmentApi } from '../../lib/resources';
import { Badge, Button, EmptyState, ErrorBanner, Field, Input, Textarea } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { TableToolbar } from '../../components/TableToolbar';
import { EnvironmentColorSwatches } from '../../components/EnvironmentColorSwatches';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;
const DEFAULT_COLOR = '#2563eb';

export default function ProjectEnvironments() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const { push } = useToast();
  const [environments, setEnvironments] = useState<Environment[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadEnvironments = () => {
    setError('');
    environmentApi
      .listByProject(project._id)
      .then(setEnvironments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load environments.'));
  };

  useEffect(() => {
    loadEnvironments();
  }, [project._id]);

  const filtered = useMemo(() => {
    if (!environments) return [];
    const q = query.trim().toLowerCase();
    if (!q) return environments;
    return environments.filter((environment) => environment.name.toLowerCase().includes(q) || environment.slug.toLowerCase().includes(q));
  }, [environments, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasCustomEnvironments = (environments ?? []).some((environment) => !environment.isSystem);
  const shouldShowCustomEnvironmentNotice = !query && environments !== null && !hasCustomEnvironments;

  function handleCreated(environment: Environment) {
    setEnvironments((prev) => (prev ? [environment, ...prev] : [environment]));
    setShowForm(false);
    push({ tone: 'success', title: 'Environment created', description: environment.name });
  }

  function handleUpdated(environment: Environment) {
    setEnvironments((prev) => prev ? prev.map((item) => item._id === environment._id ? environment : item) : [environment]);
    setEditingEnvironment(null);
    push({ tone: 'success', title: 'Environment updated', description: environment.name });
  }

  async function handleDelete(environment: Environment) {
    if (environment.isSystem) {
      push({ tone: 'danger', title: 'System environments cannot be deleted' });
      return;
    }
    if (!window.confirm(`Delete "${environment.name}"?`)) return;
    try {
      await environmentApi.remove(environment._id);
      setEnvironments((prev) => prev ? prev.filter((item) => item._id !== environment._id) : prev);
      push({ tone: 'success', title: 'Environment deleted', description: environment.name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete environment.';
      setError(message);
      push({ tone: 'danger', title: 'Could not delete environment', description: message });
    }
  }

  async function handleReorder(nextEnvironments: Environment[]) {
    const orderedIds = nextEnvironments.map((item) => item._id);
    setEnvironments(nextEnvironments);
    setSavingOrder(true);
    try {
      await environmentApi.reorder(project._id, orderedIds);
      push({ tone: 'success', title: 'Environment order updated' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update environment order.';
      setError(message);
      push({ tone: 'danger', title: 'Could not update environment order', description: message });
      loadEnvironments();
    } finally {
      setSavingOrder(false);
      setDraggedId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-sm text-fg-muted">Create and manage environment-specific rollout settings for this project.</p>
        <div className="text-sm text-fg-muted">Environments ({environments?.length ?? 0})</div>
      </div>
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
        <TableSkeleton columnsCount={4} rowsCount={5} />
      ) : query && filtered.length === 0 ? (
        <EmptyState
          icon={<Layers3 className="h-6 w-6" />}
          title="No matching environments"
          description="Try a different search term or clear the filter."
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          {shouldShowCustomEnvironmentNotice && (
            <div className="mb-3 rounded-md border border-dashed border-border bg-bg-inset/40 px-3.5 py-3">
              <p className="text-sm font-medium text-fg">No custom environments yet.</p>
              <p className="mt-1 text-sm text-fg-muted">Create one to support QA, Canary, Testing environments.</p>
            </div>
          )}
          <div className="border border-border rounded-md overflow-hidden">
            <div className="divide-y divide-border/60">
              {pageRows.map((environment) => (
                <div
                  key={environment._id}
                  draggable
                  onDragStart={() => setDraggedId(environment._id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggedId || draggedId === environment._id) return;
                    const next = [...(environments ?? [])];
                    const fromIndex = next.findIndex((item) => item._id === draggedId);
                    const toIndex = next.findIndex((item) => item._id === environment._id);
                    if (fromIndex < 0 || toIndex < 0) return;
                    const [moved] = next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, moved);
                    void handleReorder(next);
                  }}
                  className="flex items-center justify-between gap-3 bg-surface px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-fg-subtle shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: environment.color || DEFAULT_COLOR }} />
                        <p className="text-fg font-medium truncate">{environment.name}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-fg-subtle font-mono truncate">{environment.slug}</span>
                        <Badge tone={environment.isSystem ? 'brand' : 'neutral'}>{environment.isSystem ? 'System' : 'Custom'}</Badge>
                        <span className="text-fg-muted">{new Date(environment.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingEnvironment(environment)}
                      disabled={savingOrder}
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    {!environment.isSystem && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(environment)}
                        disabled={savingOrder}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New environment">
        <EnvironmentForm projectId={project._id} onSaved={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={Boolean(editingEnvironment)} onClose={() => setEditingEnvironment(null)} title="Edit environment">
        {editingEnvironment && <EnvironmentForm projectId={project._id} environment={editingEnvironment} onSaved={handleUpdated} onCancel={() => setEditingEnvironment(null)} />}
      </Modal>
    </div>
  );
}

function EnvironmentForm({
  projectId,
  environment,
  onSaved,
  onCancel,
}: {
  projectId: string;
  environment?: Environment;
  onSaved: (environment: Environment) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(environment?.name ?? '');
  const [description, setDescription] = useState(environment?.description ?? '');
  const [color, setColor] = useState(environment?.color ?? DEFAULT_COLOR);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const saved = environment
        ? await environmentApi.update(environment._id, { name, description: description || undefined, color })
        : await environmentApi.create(projectId, { name, description: description || undefined, color });
      onSaved(saved);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save environment.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="QA Testing" autoFocus />
      </Field>
      <Field label="Description (optional)">
        <Textarea rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Used for regression testing" />
      </Field>
      <Field label="Color">
        <EnvironmentColorSwatches value={color} onChange={setColor} />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (environment ? 'Saving…' : 'Creating…') : environment ? 'Save changes' : 'Create environment'}
        </Button>
      </div>
    </form>
  );
}
