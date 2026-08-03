import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  LayoutGrid,
  LogOut,
  Mail,
  Moon,
  Radio,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './ui';
import { OrgSwitcher } from './OrgSwitcher';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-border bg-bg-inset flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <Radio className="h-4.5 w-4.5 text-brand" strokeWidth={2.25} />
          <span className="font-display font-semibold text-sm tracking-tight text-fg">Rollout</span>
        </div>

        <div className="px-3 pt-3">
          <OrgSwitcher />
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <SidebarLink to="/app" icon={<LayoutGrid className="h-4 w-4" />} label="Dashboard" end />
          <SidebarLink to="/app/invitations" icon={<Mail className="h-4 w-4" />} label="Invitations" />
        </nav>

        <div className="border-t border-border p-2" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover transition-colors"
            >
              <Avatar name={user?.fullName ?? '?'} size="sm" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs text-fg truncate">{user?.fullName}</p>
                <p className="text-[11px] text-fg-subtle truncate">{user?.email}</p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-hover transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors border-t border-border"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-bg">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
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
        `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
          isActive ? 'bg-surface-hover text-fg font-medium' : 'text-fg-muted hover:text-fg hover:bg-surface-hover'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
