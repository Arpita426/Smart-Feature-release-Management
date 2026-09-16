// import { useOutletContext } from 'react-router-dom';
// import { useEffect, useMemo, useState, type FormEvent } from 'react';
// import { Mail, Plus, X } from 'lucide-react';
// import { useToast } from '../../context/ToastContext';
// import { invitationApi } from '../../lib/resources';
// import type { OrganizationInvitation } from '../../types';
// import { Badge, Button, EmptyState, ErrorBanner, Field, Input } from '../../components/ui';
// import { Modal } from '../../components/Modal';
// import { Table, TableSkeleton, type Column } from '../../components/Table';
// import { TableToolbar } from '../../components/TableToolbar';
// import type { OrgOutletContext } from './OrganizationLayout';

// const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const;

// export default function OrganizationInvitations() {
//   const { org } = useOutletContext<OrgOutletContext>();
//   const { push } = useToast();
//   const [invitations, setInvitations] = useState<OrganizationInvitation[] | null>(null);
//   const [loadError, setLoadError] = useState('');
//   const [query, setQuery] = useState('');
//   const [filter, setFilter] = useState<(typeof FILTERS)[number]>('ALL');
//   const [showForm, setShowForm] = useState(false);

//   useEffect(() => {
//     invitationApi
//       .listForOrganization(org._id)
//       .then(setInvitations)
//       .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load invitations.'));
//   }, [org._id]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return (invitations ?? []).filter((i) => {
//       const matchesQuery = !q || i.email.toLowerCase().includes(q) || i.status.toLowerCase().includes(q);
//       const matchesFilter = filter === 'ALL' || i.status === filter;
//       return matchesQuery && matchesFilter;
//     });
//   }, [invitations, filter, query]);

//   async function handleCancel(invitationId: string) {
//     try {
//       const updated = await invitationApi.cancel(org._id, invitationId);
//       setInvitations((prev) => (prev ? prev.map((inv) => (inv._id === invitationId ? updated : inv)) : prev));
//       push({ tone: 'info', title: 'Invitation cancelled' });
//     } catch (err) {
//       push({ tone: 'danger', title: 'Could not cancel invitation', description: err instanceof Error ? err.message : undefined });
//     }
//   }

//   const columns: Column<OrganizationInvitation>[] = [
//     { key: 'email', header: 'Email', render: (i) => <span className="text-fg">{i.email}</span> },
//     { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
//     {
//       key: 'sent',
//       header: 'Sent',
//       render: (i) => <span className="text-fg-muted">{new Date(i.createdAt).toLocaleDateString()}</span>,
//     },
//     {
//       key: 'actions',
//       header: '',
//       headerClassName: 'w-10',
//       render: (i) =>
//         i.status === 'PENDING' ? (
//           <button onClick={() => handleCancel(i._id)} title="Cancel invitation" className="text-fg-subtle hover:text-danger">
//             <X className="h-3.5 w-3.5" />
//           </button>
//         ) : null,
//     },
//   ];

//   return (
//     <div>
//       <p className="text-sm text-fg-muted mb-4">Invite teammates to collaborate in this organization.</p>
//       <TableToolbar
//         searchValue={query}
//         onSearchChange={setQuery}
//         searchPlaceholder="Search invitations…"
//         filterValue={filter}
//         onFilterChange={(value) => setFilter(value as (typeof FILTERS)[number])}
//         filterOptions={FILTERS.map((value) => ({ label: value.toLowerCase(), value }))}
//         filterLabel="Status"
//         filterClassName="w-28 py-1 text-xs"
//         actions={
//           <Button size="sm" onClick={() => setShowForm(true)} disabled={Boolean(loadError)}>
//             <Plus className="h-3.5 w-3.5" />
//             Invite teammate
//           </Button>
//         }
//       />

//       {loadError && (
//         <div className="mb-4 rounded-lg border border-border bg-surface/70 p-4">
//           <p className="text-sm font-medium text-fg">Invitation management is temporarily unavailable.</p>
//           <p className="mt-1 text-sm text-fg-muted">The invitation list can’t be loaded right now. Please try again shortly.</p>
//         </div>
//       )}

//       {invitations === null && !loadError ? (
//         <TableSkeleton columnsCount={3} rowsCount={4} />
//       ) : filtered.length === 0 && !loadError ? (
//         <EmptyState
//           icon={<Mail className="h-6 w-6" />}
//           title={filter === 'ALL' ? 'No invitations yet' : `No ${filter.toLowerCase()} invitations`}
//           description={filter === 'ALL' ? 'Invite a teammate to start coordinating releases and access.' : 'There are no invitations in this status right now.'}
//           action={
//             filter !== 'ALL' ? (
//               <Button variant="secondary" onClick={() => setFilter('ALL')}>
//                 Clear filter
//               </Button>
//             ) : (
//               <Button onClick={() => setShowForm(true)}>
//                 <Plus className="h-3.5 w-3.5" />
//                 Invite teammate
//               </Button>
//             )
//           }
//         />
//       ) : filtered.length > 0 ? (
//         <Table columns={columns} rows={filtered} />
//       ) : null}

//       <Modal open={showForm} onClose={() => setShowForm(false)} title="Invite teammate">
//         <InviteForm
//           organizationId={org._id}
//           onSent={(invitation) => {
//             setInvitations((prev) => (prev ? [invitation, ...prev] : [invitation]));
//             setShowForm(false);
//           }}
//           onCancel={() => setShowForm(false)}
//         />
//       </Modal>
//     </div>
//   );
// }

// function InviteForm({
//   organizationId,
//   onSent,
//   onCancel,
// }: {
//   organizationId: string;
//   onSent: (invitation: OrganizationInvitation) => void;
//   onCancel: () => void;
// }) {
//   const { push } = useToast();
//   const [email, setEmail] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const invitation = await invitationApi.send(organizationId, email);
//       push({ tone: 'success', title: 'Invitation sent', description: email });
//       onSent(invitation);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Could not send invitation.';
//       setError(message);
//       push({ tone: 'danger', title: 'Could not send invitation', description: message });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <Field label="Email">
//         <Input
//           type="email"
//           required
//           autoFocus
//           placeholder="teammate@company.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </Field>
//       {error && <ErrorBanner message={error} />}
//       <div className="flex gap-2 justify-end pt-1">
//         <Button type="button" variant="secondary" onClick={onCancel}>
//           Cancel
//         </Button>
//         <Button type="submit" disabled={loading}>
//           {loading ? 'Sending…' : 'Send invite'}
//         </Button>
//       </div>
//     </form>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   if (status === 'ACCEPTED') return <Badge tone="success">Accepted</Badge>;
//   if (status === 'REJECTED' || status === 'CANCELLED') return <Badge tone="danger">{status.toLowerCase()}</Badge>;
//   return <Badge tone="warning">Pending</Badge>;
// }


import { useOutletContext } from 'react-router-dom';
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  Mail,
  Plus,
  X,
} from 'lucide-react';

import { useToast } from '../../context/ToastContext';
import {
  invitationApi,
  projectApi,
  featureFlagApi,
} from '../../lib/resources';

import type {
  FeatureFlag,
  InvitationScope,
  OrganizationInvitation,
  Project,
  ProjectRole,
} from '../../types';

import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
} from '../../components/ui';

import { Modal } from '../../components/Modal';

import {
  Table,
  TableSkeleton,
  type Column,
} from '../../components/Table';

import { TableToolbar } from '../../components/TableToolbar';

import type {
  OrgOutletContext,
} from './OrganizationLayout';

const FILTERS = [
  'ALL',
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
] as const;

export default function OrganizationInvitations() {
  const { org } =
    useOutletContext<OrgOutletContext>();

  const { push } = useToast();

  const [
    invitations,
    setInvitations,
  ] = useState<OrganizationInvitation[] | null>(
    null
  );

  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    query,
    setQuery,
  ] = useState('');

  const [
    filter,
    setFilter,
  ] = useState<(typeof FILTERS)[number]>(
    'ALL'
  );

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  useEffect(() => {
    invitationApi
      .listForOrganization(org._id)
      .then(setInvitations)
      .catch((err) =>
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Could not load invitations.'
        )
      );
  }, [org._id]);

  useEffect(() => {
    projectApi
      .listByOrganization(org._id)
      .then(setProjects)
      .catch(() => {
        // Invitation loading should not fail
        // just because project loading failed.
      });
  }, [org._id]);

  const projectMap = useMemo(() => {
    return new Map(
      projects.map((project) => [
        project._id,
        project,
      ])
    );
  }, [projects]);

  const filtered = useMemo(() => {
    const q =
      query.trim().toLowerCase();

    return (
      invitations ?? []
    ).filter((invitation) => {
      const targetText =
        getTargetName(
          invitation,
          projectMap
        ).toLowerCase();

      const matchesQuery =
        !q ||
        invitation.email
          .toLowerCase()
          .includes(q) ||
        invitation.status
          .toLowerCase()
          .includes(q) ||
        invitation.scope
          .toLowerCase()
          .includes(q) ||
        targetText.includes(q);

      const matchesFilter =
        filter === 'ALL' ||
        invitation.status === filter;

      return (
        matchesQuery &&
        matchesFilter
      );
    });
  }, [
    invitations,
    filter,
    query,
    projectMap,
  ]);

  async function handleCancel(
    invitationId: string
  ) {
    try {
      const updated =
        await invitationApi.cancel(
          org._id,
          invitationId
        );

      setInvitations((prev) =>
        prev
          ? prev.map((invitation) =>
              invitation._id ===
              invitationId
                ? updated
                : invitation
            )
          : prev
      );

      push({
        tone: 'info',
        title: 'Invitation cancelled',
      });
    } catch (err) {
      push({
        tone: 'danger',
        title:
          'Could not cancel invitation',
        description:
          err instanceof Error
            ? err.message
            : undefined,
      });
    }
  }

  const columns: Column<OrganizationInvitation>[] =
    [
      {
        key: 'type',
        header: 'Type',
        render: (invitation) => (
          <ScopeBadge
            scope={invitation.scope}
          />
        ),
      },

      {
        key: 'target',
        header: 'Target',
        render: (invitation) => (
          <div>
            <div className="text-fg">
              {getTargetName(
                invitation,
                projectMap
              )}
            </div>

            <div className="mt-1 font-mono text-xs text-fg-muted">
              {invitation.targetId}
            </div>
          </div>
        ),
      },

      {
        key: 'email',
        header: 'Email',
        render: (invitation) => (
          <span className="text-fg">
            {invitation.email}
          </span>
        ),
      },

      {
        key: 'role',
        header: 'Role / Permissions',
        render: (invitation) => (
          <RoleOrPermissions
            invitation={invitation}
          />
        ),
      },

      {
        key: 'status',
        header: 'Status',
        render: (invitation) => (
          <StatusBadge
            status={invitation.status}
          />
        ),
      },

      {
        key: 'sent',
        header: 'Sent',
        render: (invitation) => (
          <span className="text-fg-muted">
            {new Date(
              invitation.createdAt
            ).toLocaleDateString()}
          </span>
        ),
      },

      {
        key: 'actions',
        header: '',
        headerClassName: 'w-10',
        render: (invitation) =>
          invitation.status ===
          'PENDING' ? (
            <button
              onClick={() =>
                handleCancel(
                  invitation._id
                )
              }
              title="Cancel invitation"
              className="text-fg-subtle hover:text-danger"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null,
      },
    ];

  return (
    <div>
      <p className="mb-4 text-sm text-fg-muted">
        Invite teammates to organizations,
        projects, and individual features.
      </p>

      <TableToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search invitations..."
        filterValue={filter}
        onFilterChange={(value) =>
          setFilter(
            value as (typeof FILTERS)[number]
          )
        }
        filterOptions={FILTERS.map(
          (value) => ({
            label:
              value.toLowerCase(),
            value,
          })
        )}
        filterLabel="Status"
        filterClassName="w-28 py-1 text-xs"
        actions={
          <Button
            size="sm"
            onClick={() =>
              setShowForm(true)
            }
            disabled={Boolean(
              loadError
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Invite teammate
          </Button>
        }
      />

      {loadError && (
        <div className="mb-4 rounded-lg border border-border bg-surface/70 p-4">
          <p className="text-sm font-medium text-fg">
            Invitation management is
            temporarily unavailable.
          </p>

          <p className="mt-1 text-sm text-fg-muted">
            The invitation list can't be
            loaded right now. Please try
            again shortly.
          </p>
        </div>
      )}

      {invitations === null &&
      !loadError ? (
        <TableSkeleton
          columnsCount={7}
          rowsCount={4}
        />
      ) : filtered.length === 0 &&
        !loadError ? (
        <EmptyState
          icon={
            <Mail className="h-6 w-6" />
          }
          title={
            filter === 'ALL'
              ? 'No invitations yet'
              : `No ${filter.toLowerCase()} invitations`
          }
          description={
            filter === 'ALL'
              ? 'Invite a teammate to start coordinating releases and access.'
              : 'There are no invitations in this status right now.'
          }
          action={
            filter !== 'ALL' ? (
              <Button
                variant="secondary"
                onClick={() =>
                  setFilter('ALL')
                }
              >
                Clear filter
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setShowForm(true)
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Invite teammate
              </Button>
            )
          }
        />
      ) : filtered.length > 0 ? (
        <Table
          columns={columns}
          rows={filtered}
        />
      ) : null}

      <Modal
        open={showForm}
        onClose={() =>
          setShowForm(false)
        }
        title="Invite teammate"
      >
        <InviteForm
          organizationId={org._id}
          projects={projects}
          onSent={(invitation) => {
            setInvitations((prev) =>
              prev
                ? [
                    invitation,
                    ...prev,
                  ]
                : [invitation]
            );

            setShowForm(false);
          }}
          onCancel={() =>
            setShowForm(false)
          }
        />
      </Modal>
    </div>
  );
}

function InviteForm({
  organizationId,
  projects,
  onSent,
  onCancel,
}: {
  organizationId: string;
  projects: Project[];
  onSent: (
    invitation: OrganizationInvitation
  ) => void;
  onCancel: () => void;
}) {
  const { push } = useToast();

  const [
    scope,
    setScope,
  ] = useState<InvitationScope>(
    'ORGANIZATION'
  );

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    projectId,
    setProjectId,
  ] = useState('');

  const [
    featureId,
    setFeatureId,
  ] = useState('');

  const [
    role,
    setRole,
  ] = useState<ProjectRole>(
    'DEVELOPER'
  );

  const [
    permissions,
    setPermissions,
  ] = useState<string[]>([
    'feature.view',
  ]);

  const [
    features,
    setFeatures,
  ] = useState<FeatureFlag[]>(
    []
  );

  const [
    error,
    setError,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingFeatures,
    setLoadingFeatures,
  ] = useState(false);

  useEffect(() => {
    if (
      scope !== 'FEATURE' ||
      !projectId
    ) {
      setFeatures([]);
      setFeatureId('');
      return;
    }

    setLoadingFeatures(true);

    featureFlagApi
      .listByProject(projectId)
      .then((data) => {
        setFeatures(data);

        if (
          !data.some(
            (feature) =>
              feature._id ===
              featureId
          )
        ) {
          setFeatureId(
            data[0]?._id ?? ''
          );
        }
      })
      .catch((err) => {
        setFeatures([]);
        setFeatureId('');
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load features.'
        );
      })
      .finally(() =>
        setLoadingFeatures(false)
      );
  }, [
    scope,
    projectId,
    featureId,
  ]);

  function togglePermission(
    permission: string
  ) {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter(
            (value) =>
              value !== permission
          )
        : [
            ...current,
            permission,
          ]
    );
  }

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setError('');

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        'Email is required.'
      );
      return;
    }

    if (
      scope !== 'ORGANIZATION' &&
      !projectId
    ) {
      setError(
        'Please select a project.'
      );
      return;
    }

    if (
      scope === 'FEATURE' &&
      !featureId
    ) {
      setError(
        'Please select a feature.'
      );
      return;
    }

    if (
      scope === 'FEATURE' &&
      permissions.length === 0
    ) {
      setError(
        'Select at least one feature permission.'
      );
      return;
    }

    setLoading(true);

    try {
      let invitation:
        OrganizationInvitation;

      if (
        scope === 'ORGANIZATION'
      ) {
        invitation =
          await invitationApi.send(
            organizationId,
            normalizedEmail
          );
      } else if (
        scope === 'PROJECT'
      ) {
        invitation =
          await invitationApi.sendProject(
            projectId,
            normalizedEmail,
            role
          );
      } else {
        invitation =
          await invitationApi.sendFeature(
            featureId,
            normalizedEmail,
            permissions
          );
      }

      push({
        tone: 'success',
        title: 'Invitation sent',
        description:
          normalizedEmail,
      });

      onSent(invitation);

      setEmail('');
      setProjectId('');
      setFeatureId('');
      setPermissions([
        'feature.view',
      ]);
      setScope(
        'ORGANIZATION'
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not send invitation.';

      setError(message);

      push({
        tone: 'danger',
        title:
          'Could not send invitation',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Field label="Invitation type">
        <select
          value={scope}
          onChange={(e) => {
            const nextScope =
              e.target
                .value as InvitationScope;

            setScope(nextScope);
            setProjectId('');
            setFeatureId('');
            setFeatures([]);
            setError('');
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
        >
          <option value="ORGANIZATION">
            Organization
          </option>
          <option value="PROJECT">
            Project
          </option>
          <option value="FEATURE">
            Feature
          </option>
        </select>
      </Field>

      <Field label="Email">
        <Input
          type="email"
          required
          autoFocus
          placeholder="teammate@company.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />
      </Field>

      {(
        scope === 'PROJECT' ||
        scope === 'FEATURE'
      ) && (
        <Field label="Project">
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(
                e.target.value
              );
              setFeatureId('');
              setError('');
            }}
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
          >
            <option value="">
              Select a project
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project._id}
                  value={project._id}
                >
                  {project.name}
                </option>
              )
            )}
          </select>
        </Field>
      )}

      {scope === 'PROJECT' && (
        <Field label="Project role">
          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target
                  .value as ProjectRole
              )
            }
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
          >
            <option value="VIEWER">
              Viewer
            </option>
            <option value="DEVELOPER">
              Developer
            </option>
            <option value="MAINTAINER">
              Maintainer
            </option>
            <option value="OWNER">
              Owner
            </option>
          </select>
        </Field>
      )}

      {scope === 'FEATURE' && (
        <>
          <Field label="Feature">
            <select
              value={featureId}
              onChange={(e) =>
                setFeatureId(
                  e.target.value
                )
              }
              required
              disabled={
                loadingFeatures ||
                !projectId
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg"
            >
              <option value="">
                {loadingFeatures
                  ? 'Loading features...'
                  : !projectId
                    ? 'Select a project first'
                    : 'Select a feature'}
              </option>

              {features.map(
                (feature) => (
                  <option
                    key={feature._id}
                    value={feature._id}
                  >
                    {feature.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Feature permissions">
  <div className="space-y-2 rounded-lg border border-border bg-surface/40 p-3">
    <label className="flex items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        checked={permissions.includes('feature.view')}
        onChange={() =>
          togglePermission('feature.view')
        }
      />
      <span>View</span>
    </label>

    <label className="flex items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        checked={permissions.includes('feature.update')}
        onChange={() =>
          togglePermission('feature.update')
        }
      />
      <span>Update</span>
    </label>

    <label className="flex items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        checked={permissions.includes('feature.rollout')}
        onChange={() =>
          togglePermission('feature.rollout')
        }
      />
      <span>Rollout</span>
    </label>

    <label className="flex items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        checked={permissions.includes('feature.delete')}
        onChange={() =>
          togglePermission('feature.delete')
        }
      />
      <span>Delete</span>
    </label>
  </div>
</Field>
        </>
      )}

      {error && (
        <ErrorBanner message={error} />
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Sending...'
            : 'Send invite'}
        </Button>
      </div>
    </form>
  );
}

function getTargetName(
  invitation: OrganizationInvitation,
  projectMap: Map<string, Project>
) {
  if (
    invitation.scope ===
    'ORGANIZATION'
  ) {
    return 'Organization';
  }

  if (
    invitation.scope === 'PROJECT'
  ) {
    return (
      projectMap.get(
        invitation.targetId
      )?.name ||
      'Project'
    );
  }

  return 'Feature';
}

function ScopeBadge({
  scope,
}: {
  scope: InvitationScope;
}) {
  if (scope === 'ORGANIZATION') {
    return (
      <Badge tone="brand">
        Organization
      </Badge>
    );
  }

  if (scope === 'PROJECT') {
    return (
      <Badge tone="warning">
        Project
      </Badge>
    );
  }

  return (
    <Badge tone="success">
      Feature
    </Badge>
  );
}

function RoleOrPermissions({
  invitation,
}: {
  invitation: OrganizationInvitation;
}) {
  if (
    invitation.permissions &&
    invitation.permissions.length > 0
  ) {
    return (
      <div className="flex flex-wrap gap-1">
        {invitation.permissions.map(
          (permission) => (
            <span
              key={permission}
              className="rounded bg-bg-subtle px-2 py-1 font-mono text-xs text-fg-muted"
            >
              {permission}
            </span>
          )
        )}
      </div>
    );
  }

  if (invitation.role) {
    return (
      <span className="text-sm text-fg-subtle">
        {invitation.role}
      </span>
    );
  }

  return (
    <span className="text-sm text-fg-muted">
      —
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === 'ACCEPTED') {
    return (
      <Badge tone="success">
        Accepted
      </Badge>
    );
  }

  if (
    status === 'REJECTED' ||
    status === 'CANCELLED'
  ) {
    return (
      <Badge tone="danger">
        {status ===
        'REJECTED'
          ? 'Rejected'
          : 'Cancelled'}
      </Badge>
    );
  }

  return (
    <Badge tone="warning">
      Pending
    </Badge>
  );
}