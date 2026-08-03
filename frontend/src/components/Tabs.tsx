import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export interface TabItem {
  label: string;
  to: string;
  end?: boolean;
}

export function Tabs({ items }: { items: TabItem[] }) {
  return (
    <div className="border-b border-border mb-6">
      <nav className="flex gap-5 -mb-px overflow-x-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'shrink-0 border-b-2 px-0.5 py-2.5 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-t-sm',
                isActive
                  ? 'border-brand text-fg'
                  : 'border-transparent text-fg-muted hover:text-fg hover:border-border-strong'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
