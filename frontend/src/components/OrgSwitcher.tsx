import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { organizationApi } from '../lib/resources';
import type { Organization } from '../types';

export function OrgSwitcher() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    organizationApi.list().then(setOrgs).catch(() => setOrgs([]));
  }, [orgId]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = orgs.find((o) => o._id === orgId);

  const filteredOrgs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter((org) => org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q));
  }, [orgs, query]);

  return (
    <div className="relative mb-1" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch organization"
        className="w-full flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-left hover:bg-surface-hover hover:border-border-strong transition-all duration-150 shadow-sm"
      >
        <Building2 className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
        <span className="text-xs text-fg truncate flex-1">{current ? current.name : 'Switch organization'}</span>
        <ChevronsUpDown className="h-3 w-3 text-fg-subtle shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-10 dropdown-enter">
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <Search className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search organizations"
              aria-label="Search organizations"
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filteredOrgs.length === 0 && <p className="px-3 py-2 text-xs text-fg-subtle">No matching organizations</p>}
            {filteredOrgs.map((org) => (
              <button
                key={org._id}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                  navigate(`/app/organizations/${org._id}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-fg hover:bg-surface-hover transition-colors duration-150 focus-visible:bg-surface-hover"
              >
                <span className="flex-1 text-left truncate">{org.name}</span>
                {org._id === orgId && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              setQuery('');
              navigate('/app');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fg-muted hover:bg-surface-hover transition-colors duration-150 border-t border-border"
          >
            <Plus className="h-3.5 w-3.5" />
            All organizations
          </button>
        </div>
      )}
    </div>
  );
}
