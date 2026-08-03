import { useEffect, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { projectApi } from '../../lib/resources';
import { Button, Card, ErrorBanner, Field, Input, Textarea } from '../../components/ui';
import type { ProjectOutletContext } from './ProjectLayout';

export default function ProjectSettings() {
  const { project, setProject } = useOutletContext<ProjectOutletContext>();
  const { push } = useToast();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(project.name);
    setDescription(project.description ?? '');
    setError('');
  }, [project._id, project.name, project.description]);

  const hasChanges = name.trim() !== project.name || (description.trim() || '') !== (project.description || '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const updated = await projectApi.update(project._id, {
        name: trimmedName,
        description: description.trim() || undefined,
      });

      setProject(updated);
      push({ tone: 'success', title: 'Project updated', description: updated.name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update project.';
      setError(message);
      push({ tone: 'danger', title: 'Could not update project', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="font-display text-sm font-semibold text-fg mb-3">General</h2>
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
          <dt className="text-fg-muted">Name</dt>
          <dd className="text-fg">{project.name}</dd>
          <dt className="text-fg-muted">Slug</dt>
          <dd className="text-fg font-mono">{project.slug}</dd>
          <dt className="text-fg-muted">Description</dt>
          <dd className="text-fg">{project.description || '—'}</dd>
        </dl>
      </Card>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <Input
              required
              minLength={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mobile App"
              autoFocus
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this project focus on?"
            />
          </Field>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setName(project.name);
                setDescription(project.description ?? '');
                setError('');
              }}
              disabled={loading || !hasChanges}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading || !hasChanges}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
