import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './ui';

/**
 * Client-side pagination controls. The backend list endpoints don't accept
 * page/limit params today, so this paginates an already-fetched array in
 * the browser rather than inventing query parameters the API doesn't support.
 */
export function usePagination<T>(items: T[], pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return { totalPages, pageSize };
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-xs text-fg-subtle">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <IconButton disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </IconButton>
        <IconButton disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
