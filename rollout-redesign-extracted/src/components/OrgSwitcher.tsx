import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { organizationApi } from '../lib/resources';
import type { Organization } from '../types';

export function OrgSwitcher() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    organizationApi.list().then(setOrgs).catch(() => setOrgs([]));
  }, [open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = orgs.find((o) => o._id === orgId);

  return (
    <div className="relative mb-1" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-left hover:bg-surface-hover transition-colors"
      >
        <Building2 className="h-3.5 w-3.5 text-fg-subtle shrink-0" />
        <span className="text-xs text-fg truncate flex-1">{current ? current.name : 'Switch organization'}</span>
        <ChevronsUpDown className="h-3 w-3 text-fg-subtle shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-border rounded-md shadow-lg overflow-hidden z-10">
          <div className="max-h-48 overflow-y-auto py-1">
            {orgs.length === 0 && <p className="px-3 py-2 text-xs text-fg-subtle">No organizations yet</p>}
            {orgs.map((org) => (
              <button
                key={org._id}
                onClick={() => {
                  setOpen(false);
                  navigate(`/app/organizations/${org._id}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-fg hover:bg-surface-hover transition-colors"
              >
                <span className="flex-1 text-left truncate">{org.name}</span>
                {org._id === orgId && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              navigate('/app');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-fg-muted hover:bg-surface-hover transition-colors border-t border-border"
          >
            <Plus className="h-3.5 w-3.5" />
            All organizations
          </button>
        </div>
      )}
    </div>
  );
}
