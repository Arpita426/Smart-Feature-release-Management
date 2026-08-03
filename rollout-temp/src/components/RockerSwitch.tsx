export function RockerSwitch({
  on,
  onToggle,
  disabled,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className="rocker disabled:opacity-50 disabled:cursor-not-allowed"
      data-on={on}
    >
      <span className="rocker-knob" />
    </button>
  );
}
