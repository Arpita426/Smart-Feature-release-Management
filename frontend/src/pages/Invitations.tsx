import { useEffect, useMemo, useState } from 'react';
import {  Mail, X } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { invitationApi } from '../lib/resources';
import type {
  InvitationScope,
  OrganizationInvitation,
} from '../types';

import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  PageHeader,
} from '../components/ui';

import {
  Table,
  TableSkeleton,
  type Column,
} from '../components/Table';

import { TableToolbar } from '../components/TableToolbar';

const FILTERS = [
  'ALL',
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
] as const;

export default function Invitations() {
  const { push } = useToast();



  const [invitations, setInvitations] =
    useState<OrganizationInvitation[] | null>(null);

  const [error, setError] = useState('');

  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]>('ALL');

  const [busyId, setBusyId] =
    useState<string | null>(null);

 

  /*
   * Load the current user's invitations.
   */
  async function loadInvitations() {
    try {
      setError('');

      const data =
        await invitationApi.listMine();

      setInvitations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load invitations.'
      );
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  /*
   * Handle invitation links such as:
   *
   * /app/invitations/accept?token=...
   *
   * The secure token is sent to the backend.
   */
  // useEffect(() => {
  //   const token =
  //     searchParams.get('token');

  //   if (!token) {
  //     return;
  //   }

  //   let cancelled = false;

  //   async function acceptFromLink(
  //     invitationToken: string
  //   ) {
  //     setAcceptingToken(true);

  //     try {
  //       await invitationApi.accept(
  //         invitationToken
  //       );

  //       push({
  //         tone: 'success',
  //         title: 'Invitation accepted',
  //         description:
  //           'You now have access to the invited resource.',
  //       });

  //       /*
  //        * Remove the token from the browser URL.
  //        */
  //       if (!cancelled) {
  //         setSearchParams({});
  //       }

  //       /*
  //        * Reload the invitation list so the
  //        * accepted status is shown.
  //        */
  //       await loadInvitations();
  //     } catch (err) {
  //       push({
  //         tone: 'danger',
  //         title: 'Could not accept invitation',
  //         description:
  //           err instanceof Error
  //             ? err.message
  //             : 'The invitation could not be accepted.',
  //       });

  //       if (!cancelled) {
  //         setSearchParams({});
  //       }
  //     } finally {
  //       if (!cancelled) {
  //         setAcceptingToken(false);
  //       }
  //     }
  //   }

  //   acceptFromLink(token);

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [searchParams, setSearchParams, push]);

  const filtered = useMemo(
    () =>
      (invitations ?? []).filter(
        (invitation) =>
          filter === 'ALL' ||
          invitation.status === filter
      ),
    [invitations, filter]
  );

  async function handleReject(
    invitationId: string
  ) {
    setBusyId(invitationId);

    try {
      const updated =
        await invitationApi.reject(
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
        title: 'Invitation declined',
      });
    } catch (err) {
      push({
        tone: 'danger',
        title: 'Could not decline invitation',
        description:
          err instanceof Error
            ? err.message
            : undefined,
      });
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<OrganizationInvitation>[] =
    [
      {
        key: 'scope',
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
          <div className="min-w-0">
            <div className="font-medium text-fg">
              {getTargetLabel(
                invitation.scope
              )}
            </div>

            <div className="mt-1 break-all font-mono text-xs text-fg-subtle">
              {invitation.targetId}
            </div>
          </div>
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
        key: 'expiresAt',
        header: 'Expires',
        render: (invitation) => (
          <ExpirationText
            invitation={invitation}
          />
        ),
      },

      {
        key: 'actions',
        header: '',
        headerClassName: 'w-40',
        render: (invitation) =>
          invitation.status ===
          'PENDING' ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  handleReject(
                    invitation._id
                  )
                }
                disabled={
  busyId === invitation._id
}
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </Button>
            </div>
          ) : null,
      },
    ];

  return (
    <div>
      <PageHeader
        title="Invitations"
        description="Organization, project, and feature invitations sent to your account."
      />

      {/* {acceptingToken && (
        <div className="mb-6 rounded-lg border border-border bg-bg-subtle px-4 py-3 text-sm text-fg-muted">
          Accepting your invitation...
        </div>
      )} */}

      <TableToolbar
        filterValue={filter}
        onFilterChange={(value) =>
          setFilter(
            value as (typeof FILTERS)[number]
          )
        }
        filterOptions={FILTERS.map(
          (value) => ({
            label: value.toLowerCase(),
            value,
          })
        )}
        filterLabel="Status"
        filterClassName="w-28 py-1 text-xs"
      />

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {invitations === null && !error ? (
        <TableSkeleton
          columnsCount={6}
          rowsCount={4}
        />
      ) : filtered.length === 0 ? (
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
              ? 'Invitations to organizations, projects, and features will appear here.'
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
                Reset filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          rows={filtered}
        />
      )}
    </div>
  );
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

function getTargetLabel(
  scope: InvitationScope
) {
  if (scope === 'ORGANIZATION') {
    return 'Organization';
  }

  if (scope === 'PROJECT') {
    return 'Project';
  }

  return 'Feature';
}

function RoleOrPermissions({
  invitation,
}: {
  invitation: OrganizationInvitation;
}) {
  if (invitation.permissions?.length) {
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

function ExpirationText({
  invitation,
}: {
  invitation: OrganizationInvitation;
}) {
  if (
    invitation.status !== 'PENDING'
  ) {
    return (
      <span className="text-sm text-fg-muted">
        —
      </span>
    );
  }

  const expiresAt =
    new Date(invitation.expiresAt);

  const expired =
    expiresAt.getTime() <=
    Date.now();

  if (expired) {
    return (
      <span className="text-sm text-fg-muted">
        Expired
      </span>
    );
  }

  return (
    <span className="text-sm text-fg-subtle">
      {expiresAt.toLocaleDateString()}
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
        {status === 'REJECTED'
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