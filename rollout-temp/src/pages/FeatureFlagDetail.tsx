import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { featureFlagApi } from '../lib/resources';
import type { FeatureFlag } from '../types';
import { Badge, Button, Card, ErrorBanner, Spinner } from '../components/ui';
import { RockerSwitch } from '../components/RockerSwitch';
import { SignalMeter } from '../components/SignalMeter';

export default function FeatureFlagDetail() {
  const { flagId } = useParams<{ flagId: string }>();
  const navigate = useNavigate();
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
        <BackLink />
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not toggle flag.');
    } finally {
      setToggling(false);
    }
  }

  async function handleRolloutCommit(value: number) {
    if (!flag) return;
    setSavingRollout(true);
    setError('');
    try {
      const updated = await featureFlagApi.updateRollout(flag._id, value);
      setFlag(updated);
      setRollout(updated.rolloutPercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update rollout.');
    } finally {
      setSavingRollout(false);
    }
  }

  async function handleDelete() {
    if (!flag) return;
    if (!confirm(`Delete "${flag.name}"? This can't be undone.`)) return;
    try {
      await featureFlagApi.remove(flag._id);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete flag.');
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(flag!.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <BackLink />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-paper">{flag.name}</h1>
          <button
            onClick={copyKey}
            className="inline-flex items-center gap-1.5 text-faint text-sm font-mono mt-1 hover:text-muted"
            title="Copy key"
          >
            {flag.key}
            <Copy className="h-3 w-3" />
            {copied && <span className="text-teal text-xs">Copied</span>}
          </button>
          {flag.description && <p className="text-muted text-sm mt-3 max-w-xl">{flag.description}</p>}
        </div>
        <Badge tone={flag.status === 'ENABLED' ? 'success' : 'neutral'}>{flag.status}</Badge>
      </div>

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-paper">Flag status</h2>
            <p className="text-muted text-xs mt-1">
              {flag.status === 'ENABLED' ? 'Serving to eligible users now.' : 'Not being served to any user.'}
            </p>
          </div>
          <RockerSwitch on={flag.status === 'ENABLED'} onToggle={handleToggle} disabled={toggling} />
        </div>
      </Card>

      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-semibold text-paper">Rollout</h2>
          <span className="font-mono-nums text-2xl text-amber font-semibold">{rollout}%</span>
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
          className="w-full mt-4 accent-amber"
        />
        <p className="text-faint text-xs mt-2">
          {savingRollout ? 'Saving…' : 'Drag and release to update the rollout percentage.'}
        </p>
      </Card>

      <Card className="p-6 border-clay/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold text-paper">Delete this flag</h2>
            <p className="text-muted text-xs mt-1">This can't be undone.</p>
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

function BackLink() {
  return (
    <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper mb-6">
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </Link>
  );
}
