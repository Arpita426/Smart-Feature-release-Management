import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Key, Plus, Copy, Check, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { Environment, SDKKey, SDKKeyCreatedResponse } from '../../types';
import { environmentApi, sdkKeyApi } from '../../lib/resources';
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, Input, Select } from '../../components/ui';
import { Modal } from '../../components/Modal';
import { TableSkeleton } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { TableToolbar } from '../../components/TableToolbar';
import type { ProjectOutletContext } from './ProjectLayout';

const PAGE_SIZE = 8;

export default function ProjectSDKKeys() {
  const { project } = useOutletContext<ProjectOutletContext>();
  const { push } = useToast();

  const [environments, setEnvironments] = useState<Environment[] | null>(null);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');
  const [keys, setKeys] = useState<SDKKey[] | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createKeyName, setCreateKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState<SDKKeyCreatedResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [keyToRevoke, setKeyToRevoke] = useState<SDKKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  const [keyToRegenerate, setKeyToRegenerate] = useState<SDKKey | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Load environments for project
  useEffect(() => {
    environmentApi
      .listByProject(project._id)
      .then((envs) => {
        setEnvironments(envs);
        if (envs.length > 0 && !selectedEnvId) {
          // Default to Production or first environment
          const prodEnv = envs.find((e) => e.name.toLowerCase() === 'production');
          setSelectedEnvId(prodEnv ? prodEnv._id : envs[0]._id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load environments.'));
  }, [project._id]);

  // Load SDK keys whenever selected environment changes
  const loadKeys = (envId: string) => {
    if (!envId) return;
    setLoadingKeys(true);
    setError('');
    sdkKeyApi
      .list(project._id, envId)
      .then(setKeys)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load SDK keys.'))
      .finally(() => setLoadingKeys(false));
  };

  useEffect(() => {
    if (selectedEnvId) {
      loadKeys(selectedEnvId);
    }
  }, [project._id, selectedEnvId]);

  const filtered = useMemo(() => {
    if (!keys) return [];
    const q = query.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter(
      (k) => k.name.toLowerCase().includes(q) || k.keyPrefix.toLowerCase().includes(q)
    );
  }, [keys, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    if (!createKeyName.trim() || !selectedEnvId) return;

    setCreating(true);
    setError('');
    try {
      const res = await sdkKeyApi.create(project._id, selectedEnvId, {
        name: createKeyName.trim(),
      });
      setShowCreateModal(false);
      setCreateKeyName('');
      setCreatedKeyData(res);
      loadKeys(selectedEnvId);
      push({ tone: 'success', title: 'SDK key generated successfully' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create SDK key.';
      setError(msg);
      push({ tone: 'danger', title: 'Could not create SDK key', description: msg });
    } finally {
      setCreating(false);
    }
  }

  async function handleRevokeConfirm() {
    if (!keyToRevoke || !selectedEnvId) return;
    setRevoking(true);
    try {
      await sdkKeyApi.revoke(project._id, selectedEnvId, keyToRevoke._id);
      push({ tone: 'success', title: 'SDK key revoked', description: keyToRevoke.name });
      setKeyToRevoke(null);
      loadKeys(selectedEnvId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not revoke SDK key.';
      push({ tone: 'danger', title: 'Could not revoke SDK key', description: msg });
    } finally {
      setRevoking(false);
    }
  }

  async function handleRegenerateConfirm() {
    if (!keyToRegenerate || !selectedEnvId) return;
    setRegenerating(true);
    try {
      const res = await sdkKeyApi.regenerate(project._id, selectedEnvId, keyToRegenerate._id);
      push({ tone: 'success', title: 'SDK key regenerated', description: res.name });
      setKeyToRegenerate(null);
      setCreatedKeyData(res);
      loadKeys(selectedEnvId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not regenerate SDK key.';
      push({ tone: 'danger', title: 'Could not regenerate SDK key', description: msg });
    } finally {
      setRegenerating(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const currentEnv = environments?.find((e) => e._id === selectedEnvId);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-fg flex items-center gap-2">
            <Key className="h-4 w-4 text-accent" />
            SDK Keys & API Access
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            Generate environment-scoped SDK keys to connect external applications and retrieve feature configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {environments && environments.length > 0 && (
            <div className="w-48">
              <Select
                value={selectedEnvId}
                onChange={(e) => {
                  setSelectedEnvId(e.target.value);
                  setPage(1);
                }}
              >
                {environments.map((env) => (
                  <option key={env._id} value={env._id}>
                    {env.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedEnvId}
          >
            <Plus className="h-4 w-4" />
            Create SDK Key
          </Button>
        </div>
      </Card>

      {error && <ErrorBanner message={error} />}

      {/* Toolbar & Filter */}
      <TableToolbar
        searchValue={query}
        onSearchChange={(q: string) => {
          setQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Filter SDK keys by name or prefix…"
      />

      {/* Table Content */}
      <Card className="overflow-hidden">
        {loadingKeys && !keys ? (
          <TableSkeleton rowsCount={4} columnsCount={6} />
        ) : !keys || pageRows.length === 0 ? (
          <EmptyState
            icon={<Key className="h-6 w-6" />}
            title={query ? 'No matching SDK keys found' : `No SDK keys for ${currentEnv?.name || 'this environment'}`}
            description={
              query
                ? 'Try refining your search keyword.'
                : 'Create an SDK key to allow client or server applications to fetch feature flags.'
            }
            action={
              !query ? (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  Create SDK Key
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-fg">
              <thead className="bg-bg-subtle text-fg-muted border-b border-border font-medium">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Key Prefix</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Created</th>
                  <th className="py-2.5 px-4">Last Used</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((keyItem) => {
                  const isRevoked = keyItem.status === 'REVOKED';
                  return (
                    <tr key={keyItem._id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-fg">{keyItem.name}</td>
                      <td className="py-3 px-4 font-mono text-fg-muted">
                        {keyItem.keyPrefix}••••••••••••
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={isRevoked ? 'danger' : 'success'}>
                          {keyItem.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-fg-muted">
                        {new Date(keyItem.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-fg-muted">
                        {keyItem.lastUsedAt
                          ? new Date(keyItem.lastUsedAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isRevoked && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Regenerate Key"
                              onClick={() => setKeyToRegenerate(keyItem)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Regenerate
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              title="Revoke Key"
                              onClick={() => setKeyToRevoke(keyItem)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Revoke
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-border">
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Modal: Create SDK Key */}
      <Modal
        open={showCreateModal}
        title="Create SDK Key"
        onClose={() => {
          setShowCreateModal(false);
          setCreateKeyName('');
        }}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <p className="text-xs text-fg-muted">
            Generating key for environment: <span className="font-semibold text-fg">{currentEnv?.name}</span>
          </p>

          <Field label="Key Name">
            <Input
              required
              placeholder="e.g. Production Web Application"
              value={createKeyName}
              onChange={(e) => setCreateKeyName(e.target.value)}
              autoFocus
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setCreateKeyName('');
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !createKeyName.trim()}>
              {creating ? 'Generating…' : 'Generate SDK Key'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Display Plaintext Key ONCE */}
      <Modal
        open={Boolean(createdKeyData)}
        title="SDK Key Created"
        onClose={() => setCreatedKeyData(null)}
      >
        {createdKeyData && (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Copy your SDK key now!</p>
                <p className="mt-0.5">
                  For security reasons, this full key will <strong>never be shown again</strong>. Store it safely in your environment variables.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-fg-muted">Name</label>
              <p className="text-sm font-semibold text-fg">{createdKeyData.name}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-fg-muted">Generated SDK Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 rounded border border-border bg-bg-subtle text-fg font-mono text-xs break-all">
                  {createdKeyData.key}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => copyToClipboard(createdKeyData.key)}
                >
                  {copiedKey ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setCreatedKeyData(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirm Revocation */}
      <Modal
        open={Boolean(keyToRevoke)}
        title="Revoke SDK Key?"
        onClose={() => setKeyToRevoke(null)}
      >
        {keyToRevoke && (
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              Are you sure you want to revoke the key <strong className="text-fg">{keyToRevoke.name}</strong>?
            </p>

            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              Applications using this key will immediately lose access to feature flag configurations for this environment.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setKeyToRevoke(null)}
                disabled={revoking}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRevokeConfirm}
                disabled={revoking}
              >
                {revoking ? 'Revoking…' : 'Revoke Key'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirm Regeneration */}
      <Modal
        open={Boolean(keyToRegenerate)}
        title="Regenerate SDK Key?"
        onClose={() => setKeyToRegenerate(null)}
      >
        {keyToRegenerate && (
          <div className="space-y-4">
            <p className="text-sm text-fg-muted">
              Regenerating will revoke the existing key <strong className="text-fg">{keyToRegenerate.name}</strong> and issue a brand new key.
            </p>

            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
              Existing external applications will fail to authenticate until you update them with the new key.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setKeyToRegenerate(null)}
                disabled={regenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegenerateConfirm}
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate Key'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
