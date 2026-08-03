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
              className={clsx(
                'border-b border-border last:border-b-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-hover'
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
