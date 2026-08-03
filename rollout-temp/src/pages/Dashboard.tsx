import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderKanban, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { organizationApi } from '../lib/resources';
import { cacheOrg, getCachedOrgs } from '../lib/cache';
import type { Organization } from '../types';
import { Button, Card, EmptyState, ErrorBanner, Field, Input, Textarea } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) setOrgs(getCachedOrgs(user.id));
  }, [user]);

  function handleCreated(org: Organization) {
    if (!user) return;
    cacheOrg(user.id, org);
    setOrgs(getCachedOrgs(user.id));
    setShowForm(false);
    navigate(`/app/organizations/${org._id}`);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">Organizations</h1>
          <p className="text-muted text-sm mt-1">Every organization you've created or opened.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" />
          New organization
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateOrgForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {orgs.length === 0 && !showForm ? (
        <EmptyState
          title="No organizations yet"
          description="Create an organization to start grouping projects and managing feature flags for your team."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              New organization
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {orgs.map((org) => (
            <Card
              key={org._id}
              className="p-4 cursor-pointer hover:border-faint transition-colors group"
              onClick={() => navigate(`/app/organizations/${org._id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-md bg-panel-raised border border-line flex items-center justify-center text-amber">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-paper font-medium text-sm">{org.name}</p>
                    <p className="text-faint text-xs font-mono">{org.slug}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-faint group-hover:text-amber transition-colors" />
              </div>
              {org.description && (
                <p className="text-muted text-sm mt-3 line-clamp-2">{org.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateOrgForm({
  onCreated,
  onCancel,
}: {
  onCreated: (org: Organization) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const org = await organizationApi.create({ name, description: description || undefined });
      onCreated(org);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create organization.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-base font-semibold text-paper mb-4">New organization</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input
            required
            minLength={3}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
          />
        </Field>
        <Field label="Description (optional)">
          <Textarea
            rows={2}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this organization work on?"
          />
        </Field>
        {error && <ErrorBanner message={error} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create organization'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
