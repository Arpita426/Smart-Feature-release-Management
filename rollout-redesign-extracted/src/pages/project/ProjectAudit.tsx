import { History } from 'lucide-react';
import { UnavailableNotice } from '../../components/ui';

export default function ProjectAudit() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-fg-muted">
        <History className="h-4 w-4" />
        <p className="text-sm">Audit timeline</p>
      </div>
      <UnavailableNotice>
        The backend already records audit entries internally (see{' '}
        <code className="font-mono">src/audit/audit.model.ts</code> and{' '}
        <code className="font-mono">audit.repository.ts</code> — actions like flag creation, toggles, and
        rollout updates are captured), but there's no controller or route exposing them over HTTP yet. Add
        something like <code className="font-mono">GET /api/v1/projects/:id/audit</code> (backed by{' '}
        <code className="font-mono">AuditRepository.findByEntity</code>) to power this tab — see the README.
      </UnavailableNotice>
    </div>
  );
}
