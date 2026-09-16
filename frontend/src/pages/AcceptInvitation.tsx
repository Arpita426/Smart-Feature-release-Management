import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import {
  Check,
  Mail,
  X,
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

import {
  invitationApi,
} from '../lib/resources';

import type {
  OrganizationInvitation,
} from '../types';

import {
  Badge,
  Button,
  ErrorBanner,
} from '../components/ui';

export default function AcceptInvitation() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const { push } =
    useToast();

  const [invitation, setInvitation] =
    useState<OrganizationInvitation | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState('');

  const token =
    searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError(
        'Invalid invitation link.'
      );
      setLoading(false);
      return;
    }

    invitationApi
      .preview(token)
      .then(setInvitation)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load invitation.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  async function handleAccept() {
    if (!token) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await invitationApi.accept(
        token
      );

      push({
        tone: 'success',
        title: 'Invitation accepted',
      });

      navigate(
        '/app/invitations',
        { replace: true }
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not accept invitation.';

      setError(message);

      push({
        tone: 'danger',
        title:
          'Could not accept invitation',
        description: message,
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (!invitation) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await invitationApi.reject(
        invitation._id
      );

      push({
        tone: 'info',
        title: 'Invitation declined',
      });

      navigate(
        '/app/invitations',
        { replace: true }
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not decline invitation.';

      setError(message);

      push({
        tone: 'danger',
        title:
          'Could not decline invitation',
        description: message,
      });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-border bg-surface p-6">
          Loading invitation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorBanner message={error} />

        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                '/app/invitations'
              )
            }
          >
            Back to invitations
          </Button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const expired =
    new Date(
      invitation.expiresAt
    ).getTime() <= Date.now();

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-fg">
              Invitation
            </h1>

            <p className="text-sm text-fg-muted">
              Review this invitation
              before responding.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InfoRow
            label="Type"
            value={formatScope(
              invitation.scope
            )}
          />

          <InfoRow
            label="Target"
            value={invitation.targetName ||
    invitation.targetId}
          />

          <InfoRow
            label="Email"
            value={invitation.email}
          />

          {invitation.role && (
            <InfoRow
              label="Role"
              value={invitation.role}
            />
          )}

          {invitation.permissions &&
            invitation.permissions.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-fg">
                  Permissions
                </div>

                <div className="flex flex-wrap gap-2">
                  {invitation.permissions.map(
                    (permission) => (
                      <Badge
                        key={permission}
                        tone="neutral"
                      >
                        {formatPermission(permission)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

          <InfoRow
            label="Expires"
            value={new Date(
              invitation.expiresAt
            ).toLocaleString()}
          />

         {invitation.invitedBy &&
  typeof invitation.invitedBy !== 'string' && (
    <InfoRow
      label="Invited by"
      value={
        invitation.invitedBy.fullName ||
        invitation.invitedBy.email ||
        'Unknown user'
      }
    />
  )}
        </div>

        {expired ? (
          <div className="mt-6">
            <ErrorBanner message="This invitation has expired." />
          </div>
        ) : (
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={handleReject}
              disabled={busy}
            >
              <X className="h-3.5 w-3.5" />
              Decline
            </Button>

            <Button
              onClick={handleAccept}
              disabled={busy}
            >
              <Check className="h-3.5 w-3.5" />
              {busy
                ? 'Processing...'
                : 'Accept'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-fg-muted">
        {label}
      </div>

      <div className="mt-1 break-all text-sm text-fg">
        {value}
      </div>
    </div>
  );
}

// function getTargetDisplayName(
//   invitation: OrganizationInvitation
// ): string {
//   if (invitation.scope === 'ORGANIZATION') {
//     return 'Organization';
//   }

//   if (invitation.scope === 'PROJECT') {
//     return 'Project';
//   }

//   return 'Feature';
// }
function formatPermission(
  permission: string
): string {
  const labels: Record<string, string> = {
    'feature.view': 'View',
    'feature.update': 'Update',
    'feature.rollout': 'Rollout',
    'feature.delete': 'Delete',
  };

  return labels[permission] ?? permission;
}
function formatScope(
  scope: string
) {
  if (scope === 'ORGANIZATION') {
    return 'Organization';
  }

  if (scope === 'PROJECT') {
    return 'Project';
  }

  return 'Feature';
}