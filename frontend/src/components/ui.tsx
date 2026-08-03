import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import { Search } from 'lucide-react';

// ---------- Layout primitives ----------

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('bg-surface border border-border rounded-lg shadow-sm transition-colors duration-150', className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="text-fg-muted text-sm mt-1.5 leading-6">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ---------- Form controls ----------

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        size === 'md' ? 'h-9 px-3.5 text-sm' : 'h-8 px-2.5 text-xs',
        variant === 'primary' && 'bg-brand text-brand-fg hover:brightness-105 active:brightness-95',
        variant === 'secondary' &&
          'bg-surface text-fg border border-border hover:bg-surface-hover hover:border-border-strong active:bg-bg-inset',
        variant === 'ghost' && 'text-fg-muted hover:text-fg hover:bg-surface-hover shadow-none active:bg-bg-inset',
        variant === 'danger' && 'bg-surface text-danger border border-danger/40 hover:bg-danger/10 active:bg-danger/20',
        className
      )}
      {...props}
    />
  );
}

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center h-8 w-8 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-all duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:bg-bg-inset',
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'w-full rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-all duration-150 resize-none shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg focus:border-brand outline-none transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx('block text-xs font-medium text-fg-muted mb-1.5', className)}
      {...props}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-xs font-medium text-fg-muted">
        <span className="block mb-1.5">{label}</span>
        {children}
      </label>
      {hint && <p className="text-xs text-fg-subtle mt-1">{hint}</p>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={clsx('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-subtle" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-md border border-border bg-bg-inset pl-8 pr-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-bg"
      />
    </div>
  );
}

// ---------- Status / identity ----------

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'brand';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold border leading-4',
        tone === 'neutral' && 'text-fg-muted border-border bg-bg-inset',
        tone === 'success' && 'text-success border-success/30 bg-success/10',
        tone === 'danger' && 'text-danger border-danger/30 bg-danger/10',
        tone === 'warning' && 'text-warning border-warning/30 bg-warning/10',
        tone === 'brand' && 'text-brand border-brand/30 bg-brand/10'
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const dims = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';
  return (
    <div
      className={clsx(
        'shrink-0 rounded-full bg-brand/15 border border-brand/30 text-brand flex items-center justify-center font-mono font-semibold',
        dims
      )}
    >
      {initial}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx('h-4 w-4 rounded-full border-2 border-border border-t-brand animate-spin', className)}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

// ---------- Feedback ----------

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 border border-dashed border-border rounded-lg bg-bg-inset/40">
      {icon && <div className="text-fg-subtle mb-3">{icon}</div>}
      <h3 className="font-display text-fg text-sm font-semibold">{title}</h3>
      {description && <p className="text-fg-muted text-sm mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function UnavailableNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-inset/70 px-3.5 py-3 text-xs text-fg-muted leading-relaxed shadow-sm">
      {children}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger shadow-sm">
      {message}
    </div>
  );
}
