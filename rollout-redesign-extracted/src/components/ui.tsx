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
    <div className={clsx('bg-surface border border-border rounded-md', className)} {...props}>
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
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="font-display text-xl font-semibold text-fg">{title}</h1>
        {description && <p className="text-fg-muted text-sm mt-1">{description}</p>}
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
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
        variant === 'primary' && 'bg-brand text-brand-fg hover:brightness-110',
        variant === 'secondary' &&
          'bg-surface text-fg border border-border hover:bg-surface-hover hover:border-border-strong',
        variant === 'ghost' && 'text-fg-muted hover:text-fg hover:bg-surface-hover',
        variant === 'danger' && 'bg-surface text-danger border border-danger/40 hover:bg-danger/10',
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
        'inline-flex items-center justify-center h-7 w-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors disabled:opacity-50',
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
        'w-full rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-colors',
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
        'w-full rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-colors resize-none',
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
        'rounded-md border border-border bg-bg-inset px-2.5 py-1.5 text-sm text-fg focus:border-brand outline-none transition-colors',
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
    <div>
      <Label>{label}</Label>
      {children}
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
        className="w-full rounded-md border border-border bg-bg-inset pl-8 pr-2.5 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand outline-none transition-colors"
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
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium border leading-4',
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
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 border border-dashed border-border rounded-md">
      {icon && <div className="text-fg-subtle mb-3">{icon}</div>}
      <h3 className="font-display text-fg text-sm font-semibold">{title}</h3>
      {description && <p className="text-fg-muted text-sm mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function UnavailableNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-bg-inset px-3.5 py-3 text-xs text-fg-muted leading-relaxed">
      {children}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </div>
  );
}
