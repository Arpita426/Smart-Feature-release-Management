import clsx from 'clsx';

const colors = [
  { value: '#10b981', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#64748b', label: 'Gray' },
] as const;

export function EnvironmentColorSwatches({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const selected = value === color.value;

        return (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            disabled={disabled}
            aria-label={`Select ${color.label}`}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
              selected ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-surface text-fg-muted hover:bg-surface-hover'
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.value }} />
            {color.label}
          </button>
        );
      })}
    </div>
  );
}
