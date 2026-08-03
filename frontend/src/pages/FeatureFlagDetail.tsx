import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { featureFlagApi } from '../lib/resources';
import type { FeatureFlag } from '../types';
import { Badge, Button, Card, ErrorBanner, Skeleton } from '../components/ui';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RockerSwitch } from '../components/RockerSwitch';
import { SignalMeter } from '../components/SignalMeter';

export default function FeatureFlagDetail() {
  const { flagId } = useParams<{ flagId: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [flag, setFlag] = useState<FeatureFlag | null>(null);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);
  const [rollout, setRollout] = useState(0);
  const [savingRollout, setSavingRollout] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!flagId) return;
    featureFlagApi
      .getById(flagId)
      .then((f) => {
        setFlag(f);
        setRollout(f.rolloutPercentage);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load feature flag.'));
  }, [flagId]);

  if (!flagId) return null;

  if (error && !flag) {
    return (
      <div>
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/app' }, { label: 'Feature flag' }]} />
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  async function handleToggle() {
    if (!flag) return;
    setToggling(true);
    setError('');
    try {
      const updated = await featureFlagApi.toggle(flag._id);
      setFlag(updated);
      push({
        tone: 'success',
        title: updated.status === 'ENABLED' ? 'Flag enabled' : 'Flag disabled',
        description: updated.name,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not toggle flag.';
      setError(message);
      push({ tone: 'danger', title: 'Could not toggle flag', description: message });
    } finally {
      setToggling(false);
    }
  }

  async function handleRolloutCommit(value: number) {
    if (!flag) return;
    if (value === flag.rolloutPercentage) return;
    setSavingRollout(true);
    setError('');
    try {
      const updated = await featureFlagApi.updateRollout(flag._id, value);
      setFlag(updated);
      setRollout(updated.rolloutPercentage);
      push({ tone: 'success', title: `Rollout set to ${updated.rolloutPercentage}%` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update rollout.';
      setError(message);
      push({ tone: 'danger', title: 'Could not update rollout', description: message });
    } finally {
      setSavingRollout(false);
    }
  }

  async function handleDelete() {
    if (!flag) return;
    if (!confirm(`Delete "${flag.name}"? This can't be undone.`)) return;
    try {
      await featureFlagApi.remove(flag._id);
      push({ tone: 'info', title: 'Feature flag deleted', description: flag.name });
      navigate('/app');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete flag.';
      setError(message);
      push({ tone: 'danger', title: 'Could not delete flag', description: message });
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(flag!.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/app' }, { label: flag.name }]} />

      <div className="flex items-start justify-between mb-6 mt-1 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-fg">{flag.name}</h1>
          <button
            onClick={copyKey}
            className="inline-flex items-center gap-1.5 text-fg-subtle text-sm font-mono mt-1 hover:text-fg-muted"
            title="Copy key"
          >
            {flag.key}
            <Copy className="h-3 w-3" />
            {copied && <span className="text-success text-xs">Copied</span>}
          </button>
          {flag.description && <p className="text-fg-muted text-sm mt-3 max-w-xl">{flag.description}</p>}
        </div>
        <Badge tone={flag.status === 'ENABLED' ? 'success' : 'neutral'}>{flag.status}</Badge>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-fg">Flag status</h2>
            <p className="text-fg-muted text-xs mt-1">
              {flag.status === 'ENABLED' ? 'Serving to eligible users now.' : 'Not being served to any user.'}
            </p>
          </div>
          <RockerSwitch on={flag.status === 'ENABLED'} onToggle={handleToggle} disabled={toggling} />
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-semibold text-fg">Rollout</h2>
          <span className="font-mono-nums text-xl text-brand font-semibold">{rollout}%</span>
        </div>
        <SignalMeter percentage={rollout} />
        <input
          type="range"
          min={0}
          max={100}
          value={rollout}
          onChange={(e) => setRollout(Number(e.target.value))}
          onMouseUp={(e) => handleRolloutCommit(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => handleRolloutCommit(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
              handleRolloutCommit(rollout);
            }
          }}
          onBlur={() => handleRolloutCommit(rollout)}
          className="w-full mt-4 accent-brand"
        />
        <p className="text-fg-subtle text-xs mt-2">
          {savingRollout ? 'Saving…' : 'Drag and release to update the rollout percentage.'}
        </p>
      </Card>

      <Card className="p-4 border-danger/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-fg">Delete this flag</h2>
            <p className="text-fg-muted text-xs mt-1">This can't be undone.</p>
          </div>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete flag
          </Button>
        </div>
      </Card>
    </div>
  );
}
