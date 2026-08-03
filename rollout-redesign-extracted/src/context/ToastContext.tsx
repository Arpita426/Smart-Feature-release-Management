import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'danger' | 'info' | 'warning';

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon =
    toast.tone === 'success'
      ? CheckCircle2
      : toast.tone === 'danger'
        ? XCircle
        : toast.tone === 'warning'
          ? AlertTriangle
          : Info;

  const iconColor =
    toast.tone === 'success'
      ? 'text-success'
      : toast.tone === 'danger'
        ? 'text-danger'
        : toast.tone === 'warning'
          ? 'text-warning'
          : 'text-fg-muted';

  return (
    <div className="toast-enter flex items-start gap-2.5 rounded-md border border-border bg-surface shadow-lg px-3.5 py-3">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg">{toast.title}</p>
        {toast.description && <p className="text-xs text-fg-muted mt-0.5">{toast.description}</p>}
      </div>
      <button onClick={onDismiss} className="text-fg-subtle hover:text-fg shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
