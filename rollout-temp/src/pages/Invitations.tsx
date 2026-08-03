import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { invitationApi } from '../lib/resources';
import type { OrganizationInvitation } from '../types';
import { Badge, Button, Card, EmptyState, ErrorBanner } from '../components/ui';

export default function Invitations() {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    invitationApi
      .listMine()
      .then(setInvitations)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load invitations.'))
      .finally(() => setLoaded(true));
  }, []);

  async function handleAccept(id: string) {
    setBusyId(id);
    try {
      const updated = await invitationApi.accept(id);
      setInvitations((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept invitation.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      const updated = await invitationApi.reject(id);
      setInvitations((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reject invitation.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-paper mb-1">Invitations</h1>
      <p className="text-muted text-sm mb-8">
        Organizations that have invited you to join.
      </p>

      {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

      {!loaded ? null : invitations.length === 0 ? (
        <EmptyState title="No invitations" description="You'll see pending invitations here." />
      ) : (
        <div className="space-y-2">
          {invitations.map((inv) => (
            <Card key={inv._id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-paper text-sm font-medium">Organization invite</p>
                <p className="text-faint text-xs font-mono mt-0.5">{inv.organizationId}</p>
              </div>
              <div className="flex items-center gap-2">
                {inv.status === 'PENDING' ? (
                  <>
                    <Button size="sm" onClick={() => handleAccept(inv._id)} disabled={busyId === inv._id}>
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleReject(inv._id)} disabled={busyId === inv._id}>
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </Button>
                  </>
                ) : (
                  <Badge tone={inv.status === 'ACCEPTED' ? 'success' : 'danger'}>{inv.status.toLowerCase()}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
