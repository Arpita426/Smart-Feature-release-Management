import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('bg-panel border border-line rounded-lg', className)} {...props}>
      {children}
    </div>
  );
}

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
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
        variant === 'primary' && 'bg-amber text-ink hover:brightness-110',
        variant === 'secondary' &&
          'bg-panel-raised text-paper border border-line hover:border-faint',
        variant === 'ghost' && 'text-muted hover:text-paper hover:bg-panel-raised',
        variant === 'danger' && 'bg-clay-soft text-clay border border-clay hover:brightness-125',
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
        'w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper placeholder:text-faint focus:border-amber outline-none transition-colors',
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
        'w-full rounded-md border border-line bg-panel-raised px-3 py-2 text-sm text-paper placeholder:text-faint focus:border-amber outline-none transition-colors resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx('block text-xs font-medium text-muted uppercase tracking-wide mb-1.5', className)}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'amber';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide border',
        tone === 'neutral' && 'text-muted border-line bg-panel-raised',
        tone === 'success' && 'text-teal border-teal/40 bg-teal-soft',
        tone === 'danger' && 'text-clay border-clay/40 bg-clay-soft',
        tone === 'amber' && 'text-amber border-amber/40 bg-amber-soft'
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'h-4 w-4 rounded-full border-2 border-line border-t-amber animate-spin',
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-line rounded-lg">
      <h3 className="font-display text-paper text-base font-semibold">{title}</h3>
      {description && <p className="text-muted text-sm mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-clay/40 bg-clay-soft px-3 py-2 text-sm text-clay">
      {message}
    </div>
  );
}
