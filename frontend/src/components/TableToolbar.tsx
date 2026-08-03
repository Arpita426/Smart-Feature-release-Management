import type { ReactNode } from 'react';
import { SearchInput, Select } from './ui';

export type ToolbarOption = {
  label: string;
  value: string;
};

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchClassName = 'w-64',
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Filter',
  filterClassName = 'w-36 py-1 text-xs',
  sortValue,
  onSortChange,
  sortOptions,
  sortLabel = 'Sort by',
  sortClassName = 'w-32 py-1 text-xs',
  actions,
}: {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchClassName?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: ToolbarOption[];
  filterLabel?: string;
  filterClassName?: string;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: ToolbarOption[];
  sortLabel?: string;
  sortClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 flex-wrap rounded-lg border border-border/70 bg-surface/70 px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        {typeof searchValue === 'string' && onSearchChange ? (
          <SearchInput value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} className={searchClassName} />
        ) : null}

        {typeof filterValue === 'string' && onFilterChange && filterOptions?.length ? (
          <label className="flex items-center gap-2 text-xs text-fg-muted">
            <span>{filterLabel}</span>
            <Select aria-label={`${filterLabel} filter`} value={filterValue} onChange={(e) => onFilterChange(e.target.value)} className={filterClassName}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        {typeof sortValue === 'string' && onSortChange && sortOptions?.length ? (
          <label className="flex items-center gap-2 text-xs text-fg-muted">
            <span>{sortLabel}</span>
            <Select aria-label={`${sortLabel} sort`} value={sortValue} onChange={(e) => onSortChange(e.target.value)} className={sortClassName}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        ) : null}
      </div>

      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
