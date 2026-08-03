// The backend currently has no "list my organizations" or "list projects in
// an organization" endpoints (see README "Backend gaps"). Until those exist,
// we remember what the signed-in user has created or opened so the sidebar
// has something to show. This is a stopgap, not a source of truth — data
// fetched from the real endpoints (org/project detail, members, flags)
// always wins over anything cached here.
import type { Organization, Project } from '../types';

function keyFor(userId: string, kind: 'orgs' | 'projects') {
  return `rollout.cache.${kind}.${userId}`;
}

export function getCachedOrgs(userId: string): Organization[] {
  try {
    const raw = localStorage.getItem(keyFor(userId, 'orgs'));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function cacheOrg(userId: string, org: Organization) {
  const existing = getCachedOrgs(userId).filter((o) => o._id !== org._id);
  const next = [org, ...existing];
  localStorage.setItem(keyFor(userId, 'orgs'), JSON.stringify(next));
}

export function getCachedProjects(userId: string, organizationId: string): Project[] {
  try {
    const raw = localStorage.getItem(keyFor(userId, 'projects'));
    const all: Project[] = raw ? JSON.parse(raw) : [];
    return all.filter((p) => p.organizationId === organizationId);
  } catch {
    return [];
  }
}

export function cacheProject(userId: string, project: Project) {
  try {
    const raw = localStorage.getItem(keyFor(userId, 'projects'));
    const all: Project[] = raw ? JSON.parse(raw) : [];
    const next = [project, ...all.filter((p) => p._id !== project._id)];
    localStorage.setItem(keyFor(userId, 'projects'), JSON.stringify(next));
  } catch {
    // ignore cache write failures
  }
}
