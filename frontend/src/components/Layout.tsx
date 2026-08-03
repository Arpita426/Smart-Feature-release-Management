import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronsUpDown,
  Flag,
  FolderKanban,
  History,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Moon,
  Radio,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './ui';
import { OrgSwitcher } from './OrgSwitcher';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId, projectId } = useParams<{ orgId?: string; projectId?: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const organizationBase = orgId ? `/app/organizations/${orgId}` : null;
  const projectBase = orgId && projectId ? `/app/organizations/${orgId}/projects/${projectId}` : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Header (only visible on mobile) */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-bg-inset/80 md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Radio className="h-4.5 w-4.5 text-brand" strokeWidth={2.25} />
          <span className="font-display font-semibold text-sm tracking-tight text-fg">Rollout</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="p-1.5 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg transition-colors focus-visible:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-bg-inset/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-surface flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:bg-bg-inset/80 md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Radio className="h-4.5 w-4.5 text-brand" strokeWidth={2.25} />
            <span className="font-display font-semibold text-sm tracking-tight text-fg">Rollout</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="p-1 rounded-md hover:bg-surface-hover text-fg-subtle hover:text-fg md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pt-3">
          <OrgSwitcher />
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <SidebarLink to="/app" icon={<LayoutGrid className="h-4 w-4" />} label="Dashboard" end />
          <SidebarLink to="/app/invitations" icon={<Mail className="h-4 w-4" />} label="Invitations" />

          {organizationBase && (
            <SidebarLink to={`${organizationBase}/projects`} icon={<FolderKanban className="h-4 w-4" />} label="Projects" />
          )}

          {projectBase && (
            <>
              <SidebarLink to={`${projectBase}/feature-flags`} icon={<Flag className="h-4 w-4" />} label="Feature Flags" />
              <SidebarLink to={`${projectBase}/audit`} icon={<History className="h-4 w-4" />} label="Audit Logs" />
            </>
          )}

          {organizationBase && (
            <SidebarLink to={projectBase ?? `${organizationBase}/settings`} icon={<Settings className="h-4 w-4" />} label="Settings" />
          )}
        </nav>

        <div className="border-t border-border p-2" ref={menuRef}>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-hover transition-all duration-150"
            >
              <Avatar name={user?.fullName ?? '?'} size="sm" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs text-fg truncate">{user?.fullName}</p>
                <p className="text-[11px] text-fg-subtle truncate">{user?.email}</p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden dropdown-enter">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle color theme"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fg hover:bg-surface-hover transition-colors duration-150"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors duration-150 border-t border-border"
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
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-10">
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
        `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-150 border outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
          isActive
            ? 'bg-brand/10 text-brand font-semibold border-brand/20 shadow-sm'
            : 'text-fg-muted hover:text-fg hover:bg-surface-hover border-transparent'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
