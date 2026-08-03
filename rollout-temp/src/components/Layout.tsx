import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, LogOut, Mail, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-line bg-ink-soft flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-line">
          <Radio className="h-5 w-5 text-amber" strokeWidth={2.25} />
          <span className="font-display font-semibold tracking-tight text-paper">Rollout</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarLink to="/app" icon={<LayoutGrid className="h-4 w-4" />} label="Organizations" end />
          <SidebarLink to="/app/invitations" icon={<Mail className="h-4 w-4" />} label="Invitations" />
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="h-8 w-8 rounded-md bg-amber-soft border border-amber/40 text-amber flex items-center justify-center font-mono text-sm font-semibold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-paper truncate">{user?.fullName}</p>
              <p className="text-xs text-faint truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-faint hover:text-clay transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-panel-raised text-paper border border-line'
            : 'text-muted hover:text-paper hover:bg-panel-raised border border-transparent'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
