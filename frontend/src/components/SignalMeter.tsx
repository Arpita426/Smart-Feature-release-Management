/**
 * Signature component: rollout percentage rendered as a segmented signal
 * meter (20 ticks, 5% each) rather than a generic progress bar — evokes the
 * gradual, staged nature of a feature rollout.
 */
export function SignalMeter({ percentage }: { percentage: number }) {
  const litCount = Math.round((percentage / 100) * 20);
  return (
    <div className="signal-meter" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="segment" data-lit={i < litCount} />
      ))}
    </div>
  );
}
