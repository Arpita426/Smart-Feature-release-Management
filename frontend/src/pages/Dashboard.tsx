import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Clock3, Flag, FolderKanban, Mail, Plus, Users } from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../context/ToastContext';
import { organizationApi, projectApi, invitationApi, featureFlagApi, projectMemberApi } from '../lib/resources';
import type { AuditLog, Organization, Project, FeatureFlag } from '../types';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  PageHeader,
  Skeleton,
  Textarea,
} from '../components/ui';
import { Modal } from '../components/Modal';

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function renderActivityText(entry: AuditLog, nameMap: Record<string, string>) {
  const userName = entry.userId && typeof entry.userId === 'object' 
    ? (entry.userId.fullName || entry.userId.email || 'Someone') 
    : 'Someone';
  const entityName = nameMap[entry.entityId] || '';
  const entityQuoted = entityName ? `"${entityName}"` : '';

  const boldUser = <span className="font-semibold text-fg">{userName}</span>;
  const boldEntity = entityQuoted ? <span className="font-semibold text-fg">{entityQuoted}</span> : null;

  switch (entry.action) {
    case 'CREATE_ORGANIZATION':
      return <>{boldUser} created organization {boldEntity}</>;
    case 'CREATE_PROJECT':
      return <>{boldUser} created project {boldEntity}</>;
    case 'CREATE_FEATURE_FLAG':
      return <>{boldUser} created feature flag {boldEntity}</>;
    case 'TOGGLE_FEATURE_FLAG':
      return <>{boldUser} toggled feature flag {boldEntity}</>;
    case 'UPDATE_ROLLOUT':
      return <>{boldUser} updated rollout for {boldEntity}</>;
    case 'SEND_ORGANIZATION_INVITATION':
      return <>{boldUser} invited a member to organization</>;
    case 'ACCEPT_ORGANIZATION_INVITATION':
      return <>{boldUser} accepted organization invitation</>;
    case 'REJECT_ORGANIZATION_INVITATION':
      return <>{boldUser} declined organization invitation</>;
    case 'CANCEL_ORGANIZATION_INVITATION':
      return <>{boldUser} cancelled organization invitation</>;
    case 'ADD_PROJECT_MEMBER':
      return <>{boldUser} added a member to project</>;
    case 'REMOVE_PROJECT_MEMBER':
      return <>{boldUser} removed a member from project</>;
    case 'UPDATE_PROJECT_MEMBER_ROLE':
      return <>{boldUser} updated a project member's role</>;
    default:
      return <>{boldUser} performed {entry.action.toLowerCase().replace(/_/g, ' ')}</>;
  }
}

function getActivityIcon(action: string) {
  const sizeClass = "h-3.5 w-3.5";
  switch (action) {
    case 'CREATE_ORGANIZATION':
    case 'CREATE_PROJECT':
      return <Plus className={`${sizeClass} text-brand`} />;
    case 'CREATE_FEATURE_FLAG':
      return <Flag className={`${sizeClass} text-brand`} />;
    case 'TOGGLE_FEATURE_FLAG':
      return <Flag className={`${sizeClass} text-success`} />;
    case 'UPDATE_ROLLOUT':
      return <Flag className={`${sizeClass} text-warning`} />;
    case 'SEND_ORGANIZATION_INVITATION':
      return <Mail className={`${sizeClass} text-brand`} />;
    case 'ACCEPT_ORGANIZATION_INVITATION':
      return <Mail className={`${sizeClass} text-success`} />;
    case 'REJECT_ORGANIZATION_INVITATION':
    case 'CANCEL_ORGANIZATION_INVITATION':
      return <Mail className={`${sizeClass} text-danger`} />;
    case 'ADD_PROJECT_MEMBER':
    case 'UPDATE_PROJECT_MEMBER_ROLE':
      return <Users className={`${sizeClass} text-brand`} />;
    case 'REMOVE_PROJECT_MEMBER':
      return <Users className={`${sizeClass} text-danger`} />;
    default:
      return <Clock3 className={`${sizeClass} text-fg-subtle`} />;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [pendingInvites, setPendingInvites] = useState<number | null>(null);
  const [featureFlagCount, setFeatureFlagCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<Project[] | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllOrgs, setShowAllOrgs] = useState(false);

  // Stats computed on top of loaded values
  const [allFlags, setAllFlags] = useState<FeatureFlag[] | null>(null);
  const [uniqueMembers, setUniqueMembers] = useState<any[] | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, { flagCount: number; memberCount: number; updatedAt: string; description?: string }> | null>(null);
  const [orgStats, setOrgStats] = useState<Record<string, { projectCount: number; flagCount: number; memberCount: number; lastUpdated: string }> | null>(null);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const list = await organizationApi.list();
        setOrgs(list);

        const projectResults = await Promise.allSettled(list.map((org) => projectApi.listByOrganization(org._id)));
        const projects = projectResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
        setProjectCount(projects.length);

        const sortedProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllProjects(sortedProjects);

        const [flagResults, memberResults, auditResults] = await Promise.all([
          Promise.allSettled(projects.map((project) => featureFlagApi.listByProject(project._id))),
          Promise.allSettled(projects.map((project) => projectMemberApi.list(project._id))),
          Promise.allSettled(projects.map((project) => projectApi.listAudits(project._id))),
        ]);

        const totalFlags = flagResults.reduce((sum, result) => sum + (result.status === 'fulfilled' ? result.value.length : 0), 0);
        const totalMembers = memberResults.reduce((sum, result) => sum + (result.status === 'fulfilled' ? result.value.length : 0), 0);
        const activity = auditResults
          .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setFeatureFlagCount(totalFlags);
        setMemberCount(totalMembers);
        setRecentActivity(activity);

        // Compute advanced stats
        const names: Record<string, string> = {};
        list.forEach((o) => { names[o._id] = o.name; });
        projects.forEach((p) => { names[p._id] = p.name; });

        const flags = flagResults.flatMap((res) => res.status === 'fulfilled' ? res.value : []);
        flags.forEach((f) => { names[f._id] = f.name || f.key; });

        const members = memberResults.flatMap((res) => res.status === 'fulfilled' ? res.value : []);
        const uniqueMembersMap = new Map<string, any>();
        members.forEach((m) => {
          const uId = typeof m.userId === 'string' ? m.userId : m.userId?._id;
          if (uId && !uniqueMembersMap.has(uId)) {
            uniqueMembersMap.set(uId, m);
          }
        });
        const computedUniqueMembers = Array.from(uniqueMembersMap.values());

        const projStats: Record<string, { flagCount: number; memberCount: number; updatedAt: string; description?: string }> = {};
        projects.forEach((p, idx) => {
          const pFlags = flagResults[idx].status === 'fulfilled' ? flagResults[idx].value : [];
          const pMembers = memberResults[idx].status === 'fulfilled' ? memberResults[idx].value : [];
          projStats[p._id] = {
            flagCount: pFlags.length,
            memberCount: pMembers.length,
            updatedAt: p.updatedAt,
            description: p.description,
          };
        });

        const orgsStats: Record<string, { projectCount: number; flagCount: number; memberCount: number; lastUpdated: string }> = {};
        list.forEach((org) => {
          const orgProjects = projects.filter((p) => p.organizationId === org._id);
          
          let orgFlagsCount = 0;
          const orgMemberIds = new Set<string>();
          let maxUpdated = new Date(org.updatedAt).getTime();

          orgProjects.forEach((p) => {
            const pIdx = projects.findIndex((proj) => proj._id === p._id);
            if (pIdx !== -1) {
              const pFlags = flagResults[pIdx].status === 'fulfilled' ? flagResults[pIdx].value : [];
              orgFlagsCount += pFlags.length;

              const pMembers = memberResults[pIdx].status === 'fulfilled' ? memberResults[pIdx].value : [];
              pMembers.forEach((m) => {
                const uId = typeof m.userId === 'string' ? m.userId : m.userId?._id;
                if (uId) orgMemberIds.add(uId);
              });

              const projUpdated = new Date(p.updatedAt).getTime();
              if (projUpdated > maxUpdated) {
                maxUpdated = projUpdated;
              }
            }
          });

          orgsStats[org._id] = {
            projectCount: orgProjects.length,
            flagCount: orgFlagsCount,
            memberCount: orgMemberIds.size,
            lastUpdated: new Date(maxUpdated).toISOString(),
          };
        });

        setNameMap(names);
        setAllFlags(flags);
        setUniqueMembers(computedUniqueMembers);
        setProjectStats(projStats);
        setOrgStats(orgsStats);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load dashboard data.');
      }
    }

    loadDashboardData();
  }, []);

  useEffect(() => {
    invitationApi
      .listMine()
      .then((invites) => setPendingInvites(invites.filter((i) => i.status === 'PENDING').length))
      .catch(() => setPendingInvites(null));
  }, []);

  function handleCreated(org: Organization) {
    setOrgs((prev) => (prev ? [org, ...prev] : [org]));
    setShowForm(false);
    navigate(`/app/organizations/${org._id}`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="An overview of your organizations, projects, and pending invites."
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" />
            New organization
          </Button>
        }
      />

      {/* Top Row: 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Organizations" value={orgs?.length ?? null} />
        <StatCard icon={<FolderKanban className="h-4 w-4" />} label="Projects" value={projectCount} />
        <StatCard icon={<Flag className="h-4 w-4" />} label="Feature flags" value={featureFlagCount} />
        <StatCard
          icon={<Mail className="h-4 w-4" />}
          label="Pending invitations"
          value={pendingInvites}
          onClick={() => navigate('/app/invitations')}
        />
      </div>

      {/* Second Row: 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* KPI Summaries Column */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Members KPI Card */}
          <Card className="p-3 flex items-center justify-between h-[90px]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Members</h3>
                {memberCount === null ? (
                  <Skeleton className="h-5 w-12 mt-0.5" />
                ) : (
                  <p className="font-mono-nums text-lg font-semibold text-fg mt-0.5">{memberCount}</p>
                )}
              </div>
            </div>
            {memberCount !== null && (
              <div className="flex -space-x-1.5 overflow-hidden">
                {uniqueMembers?.slice(0, 3).map((m, idx) => {
                  const name = typeof m.userId === 'object' ? m.userId.fullName : 'Member';
                  return (
                    <div key={idx} className="ring-2 ring-surface rounded-full overflow-hidden shrink-0" title={name}>
                      <Avatar name={name} size="sm" />
                    </div>
                  );
                })}
                {(uniqueMembers?.length ?? 0) > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-inset border border-border text-[9px] font-semibold text-fg-muted ring-2 ring-surface shrink-0">
                    +{(uniqueMembers?.length ?? 0) - 3}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Flags KPI Card */}
          <Card className="p-3 flex items-center justify-between h-[90px]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
                <Flag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider">Flags</h3>
                {featureFlagCount === null ? (
                  <Skeleton className="h-5 w-12 mt-0.5" />
                ) : (
                  <p className="font-mono-nums text-lg font-semibold text-fg mt-0.5">{featureFlagCount}</p>
                )}
              </div>
            </div>
            {featureFlagCount !== null && (
              <div className="flex gap-2.5 text-[10px] text-fg-muted font-mono leading-normal shrink-0">
                <div>
                  <span className="text-success font-semibold">{allFlags?.filter(f => f.status === 'ENABLED').length ?? 0}</span> ON
                </div>
                <div>
                  <span className="font-semibold">{allFlags?.filter(f => f.status === 'DISABLED').length ?? 0}</span> OFF
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Projects Column */}
        <div className="lg:col-span-5">
          <Card className="p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
                    <FolderKanban className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Recent Projects</h3>
                </div>
                {allProjects && allProjects.length > 3 && (
                  <button
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="text-xs text-brand hover:underline font-medium focus-visible:outline-none"
                  >
                    {showAllProjects ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>

              <div className="space-y-2 mt-2">
                {allProjects === null ? (
                  <div className="space-y-2">
                    <Skeleton className="h-[68px] w-full" />
                    <Skeleton className="h-[68px] w-full" />
                  </div>
                ) : allProjects.length === 0 ? (
                  <p className="text-xs text-fg-muted py-4">No active projects yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {(showAllProjects ? allProjects : allProjects.slice(0, 3)).map((project) => {
                      const stats = projectStats?.[project._id];
                      return (
                        <div
                          key={project._id}
                          onClick={() => navigate(`/app/organizations/${project.organizationId}/projects/${project._id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/app/organizations/${project.organizationId}/projects/${project._id}`);
                            }
                          }}
                          tabIndex={0}
                          className="group flex flex-col justify-between p-2.5 rounded-lg border border-border bg-bg/40 hover:border-brand/40 hover:bg-surface-hover/30 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                        >
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-fg group-hover:text-brand transition-colors truncate">
                                {project.name}
                              </h4>
                              <p className="text-[11px] text-fg-muted mt-0.5 line-clamp-1 leading-normal">
                                {project.description || 'No description provided.'}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-fg-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                          </div>
                          
                          <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-border/40 text-[9px] text-fg-subtle">
                            <div className="flex items-center gap-2.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Flag className="h-2.5 w-2.5 text-fg-subtle" />
                                {stats?.flagCount ?? 0} flags
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Users className="h-2.5 w-2.5 text-fg-subtle" />
                                {stats?.memberCount ?? 0} members
                              </span>
                            </div>
                            <span className="font-mono text-fg-subtle">
                              {stats?.updatedAt ? formatRelativeTime(stats.updatedAt) : 'recently'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity Column */}
        <div className="lg:col-span-4">
          <Card className="p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
                  <Clock3 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Recent Activity</h3>
              </div>
              <div className="space-y-2 mt-2">
                {recentActivity === null ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-xs text-fg-muted py-2">No recent activity logged.</p>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {recentActivity.map((entry, idx) => (
                        <li key={entry._id}>
                          <div className="relative pb-3">
                            {idx !== recentActivity.length - 1 && (
                              <span className="absolute top-3.5 left-3.5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-2">
                              <div>
                                <span className="h-7 w-7 rounded-full bg-bg-inset border border-border flex items-center justify-center ring-4 ring-surface shrink-0">
                                  {getActivityIcon(entry.action)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 pt-1 flex justify-between gap-2">
                                <p className="text-[11px] text-fg-muted leading-relaxed line-clamp-2">
                                  {renderActivityText(entry, nameMap)}
                                </p>
                                <div className="text-right text-[9px] whitespace-nowrap text-fg-subtle font-mono shrink-0 pt-0.5">
                                  {formatRelativeTime(entry.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Organizations Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-fg tracking-tight">Organizations</h2>
          {orgs && orgs.length > 3 && (
            <button
              onClick={() => setShowAllOrgs(!showAllOrgs)}
              className="text-xs text-brand hover:underline font-medium focus-visible:outline-none"
            >
              {showAllOrgs ? 'Show less' : 'View all'}
            </button>
          )}
        </div>

        {loadError && (
          <div className="mb-4">
            <ErrorBanner message={loadError} />
          </div>
        )}

        {orgs === null && !loadError ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : orgs && orgs.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="No organizations yet"
            description="Create an organization to group projects, manage rollout work, and keep your team aligned."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" />
                New organization
              </Button>
            }
          />
        ) : orgs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllOrgs ? orgs : orgs.slice(0, 3)).map((org) => {
              const stats = orgStats?.[org._id];
              return (
                <Card
                  key={org._id}
                  className="p-3.5 cursor-pointer hover:border-brand/40 hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg h-[110px]"
                  onClick={() => navigate(`/app/organizations/${org._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/app/organizations/${org._id}`);
                    }
                  }}
                  tabIndex={0}
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-md bg-bg-inset border border-border flex items-center justify-center text-brand shrink-0 group-hover:text-brand-strong transition-colors">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-fg font-medium text-xs truncate group-hover:text-brand transition-colors">{org.name}</p>
                          <p className="text-fg-subtle text-[10px] font-mono truncate">{org.slug}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-fg-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    {org.description && (
                      <p className="text-fg-muted text-[10px] mt-1.5 line-clamp-1 leading-normal">{org.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-border/50 text-[9px] text-fg-subtle">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-mono" title={`${stats?.projectCount ?? 0} Projects`}>
                        <FolderKanban className="h-2.5 w-2.5 text-fg-subtle" />
                        {stats?.projectCount ?? 0} proj
                      </span>
                      <span className="flex items-center gap-1 font-mono" title={`${stats?.flagCount ?? 0} Feature Flags`}>
                        <Flag className="h-2.5 w-2.5 text-fg-subtle" />
                        {stats?.flagCount ?? 0} flags
                      </span>
                      <span className="flex items-center gap-1 font-mono" title={`${stats?.memberCount ?? 0} Members`}>
                        <Users className="h-2.5 w-2.5 text-fg-subtle" />
                        {stats?.memberCount ?? 0} memb
                      </span>
                    </div>
                    <span className="font-mono text-fg-subtle">
                      {stats?.lastUpdated ? formatRelativeTime(stats.lastUpdated) : 'recently'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New organization">
        <CreateOrgForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  onClick?: () => void;
}) {
  return (
    <Card
      className={clsx(
        "p-4 flex items-center gap-3 transition-all duration-200 outline-none",
        onClick && "cursor-pointer hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="h-9 w-9 rounded-md bg-bg-inset border border-border flex items-center justify-center text-fg-muted shrink-0">
        {icon}
      </div>
      <div>
        {value === null ? (
          <Skeleton className="h-6 w-8" />
        ) : (
          <p className="font-mono-nums text-xl font-semibold text-fg">{value}</p>
        )}
        <p className="text-xs text-fg-muted font-medium">{label}</p>
      </div>
    </Card>
  );
}

function CreateOrgForm({
  onCreated,
  onCancel,
}: {
  onCreated: (org: Organization) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const org = await organizationApi.create({ name, description: description || undefined });
      push({ tone: 'success', title: 'Organization created', description: org.name });
      onCreated(org);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create organization.';
      setError(message);
      push({ tone: 'danger', title: 'Could not create organization', description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus />
      </Field>
      <Field label="Description (optional)">
        <Textarea
          rows={2}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this organization work on?"
        />
      </Field>
      {error && <ErrorBanner message={error} />}
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create organization'}
        </Button>
      </div>
    </form>
  );
}
