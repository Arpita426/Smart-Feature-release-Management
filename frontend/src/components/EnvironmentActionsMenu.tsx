import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function EnvironmentActionsMenu({
  disabled,
  onEdit,
  onDelete,
}: {
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open environment actions"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-fg shadow-sm transition-all duration-150 hover:border-border-strong hover:bg-surface-hover hover:text-fg active:bg-bg-inset disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-fg transition-colors hover:bg-surface-hover"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <PencilLine className="h-3.5 w-3.5" />
            Edit
          </button>
          <div className="border-t border-border/70" />
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
