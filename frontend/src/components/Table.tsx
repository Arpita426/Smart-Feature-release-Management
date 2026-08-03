import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export function Table<T extends { _id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-border bg-bg-inset">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'text-left font-medium text-fg-muted text-xs uppercase tracking-wide px-3.5 py-2.5',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => {
                if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onRowClick(row);
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              className={clsx(
                'border-b border-border last:border-b-0 transition-colors duration-150',
                onRowClick && 'cursor-pointer hover:bg-surface-hover focus-visible:outline-none focus-visible:bg-surface-hover'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-3.5 py-2.5 align-middle', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ columnsCount = 3, rowsCount = 5 }: { columnsCount?: number; rowsCount?: number }) {
  return (
    <div className="border border-border rounded-md overflow-hidden bg-surface shadow-sm">
      <div className="border-b border-border bg-bg-inset h-9 flex items-center px-3.5 gap-4">
        {Array.from({ length: columnsCount }).map((_, cIdx) => (
          <div
            key={cIdx}
            className={clsx(
              "h-3 bg-fg-muted/10 rounded animate-pulse",
              cIdx === 0 ? "w-24" : cIdx === 1 ? "w-16" : "w-20"
            )}
          />
        ))}
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rowsCount }).map((_, idx) => (
          <div key={idx} className="h-[45px] flex items-center px-3.5 gap-4">
            {Array.from({ length: columnsCount }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={clsx(
                  "h-3 bg-fg-muted/10 rounded animate-pulse",
                  cIdx === 0 ? "w-1/3" : cIdx === 1 ? "w-1/4" : "w-1/6"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
