import { useEffect, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { organizationApi } from '../../lib/resources';
import { Button, Card, ErrorBanner, Field, Input, Textarea } from '../../components/ui';
import type { OrgOutletContext } from './OrganizationLayout';

export default function OrganizationSettings() {
  const { org, setOrg } = useOutletContext<OrgOutletContext>();
  const { push } = useToast();
  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(org.name);
    setDescription(org.description ?? '');
    setError('');
  }, [org._id, org.name, org.description]);

  const hasChanges = name.trim() !== org.name || (description.trim() || '') !== (org.description || '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Organization name is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const updated = await organizationApi.update(org._id, {
        name: trimmedName,
        description: description.trim() || undefined,
      });

      setOrg(updated);
      push({ tone: 'success', title: 'Organization updated', description: updated.name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update organization.';
      setError(message);
      push({ tone: 'danger', title: 'Could not update organization', description: message });
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
          <dd className="text-fg">{org.name}</dd>
          <dt className="text-fg-muted">Slug</dt>
          <dd className="text-fg font-mono">{org.slug}</dd>
          <dt className="text-fg-muted">Description</dt>
          <dd className="text-fg">{org.description || '—'}</dd>
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
              placeholder="Acme Inc."
              autoFocus
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this organization work on?"
            />
          </Field>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setName(org.name);
                setDescription(org.description ?? '');
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
