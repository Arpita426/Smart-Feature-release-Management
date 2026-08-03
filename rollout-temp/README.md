# Rollout — frontend for the Feature Release Management API

React + TypeScript + Tailwind (v4) + Vite. Talks to your Express/Mongo backend
over the `/api/v1` routes exactly as they're written today.

## Run it

```bash
npm install
cp .env.example .env      # already done — edit if your API runs on a different port
npm run dev
```

Opens on `http://localhost:5173`. It expects the backend at
`http://localhost:3000/api/v1` by default — change `VITE_API_BASE_URL` in
`.env` if yours runs elsewhere.

## What's built

- **Auth** — register, login, session persisted via JWT in `localStorage`, auto-redirect to login on 401
- **Organizations** — create, invite teammates, view/cancel invitations
- **Projects** — create within an org, view feature flags, manage members
- **Feature flags** — create, list, toggle on/off, adjust rollout %, delete
- **My invitations** — accept/reject invites to join an organization

The rollout percentage is rendered as a 20-segment "signal meter" and the
enable/disable control is a rocker switch — a deliberate choice to match the
staged, mechanical feel of a rollout, instead of a generic progress bar/iOS toggle.

## Backend gaps you'll want to fix

I built this against your code exactly as uploaded. Two things in the backend
currently limit what the frontend can do — worth fixing on your end:

### 1. Two route files aren't mounted in `src/app.ts`

`organization-invitation.routes.ts` and `project-member.routes.ts` both exist
and are fully implemented, but `app.ts` never registers them, so those
endpoints 404 right now. The "Invite a teammate" and "Members" sections in
this app will show a load error until you add:

```ts
import organizationInvitationRoutes from './organization-invitation/organization-invitation.routes';
import projectMemberRoutes from './project-member/project-member.routes';

app.use('/api/v1/organization-invitations', organizationInvitationRoutes);
app.use('/api/v1/project-members', projectMemberRoutes);
```

(These prefixes match what `frontend/src/lib/resources.ts` already calls —
no frontend changes needed once you add these two lines.)

### 2. No "list" or "get by id" endpoints for organizations/projects

Only `POST /organizations` and `POST /projects` exist — there's no
`GET /organizations`, `GET /organizations/:id`, `GET /projects`, or
`GET /projects/:id`. Without these, a page reload or a fresh browser has no
way to ask the backend "what organizations does this user belong to?"

As a stopgap, this frontend remembers organizations/projects you've created
or opened in `localStorage` per-user (see `src/lib/cache.ts`) so the sidebar
and dashboard have something to show. That's a workaround, not a fix — it
won't show orgs/projects created from another device or session, and it
won't reflect memberships gained by accepting an invitation.

To make this solid, add:
- `GET /api/v1/organizations` — organizations the current user is a member of
- `GET /api/v1/organizations/:id` — single organization detail
- `GET /api/v1/projects?organizationId=...` — projects in an organization
- `GET /api/v1/projects/:id` — single project detail

Once those exist, swap the `getCachedOrgs`/`getCachedProjects` calls in
`Dashboard.tsx`, `OrganizationDetail.tsx`, and `ProjectDetail.tsx` for real
fetches — the rest of the app doesn't need to change.

## Project structure

```
src/
  lib/
    api.ts          axios instance, JWT header injection, error normalizing
    resources.ts    one function per backend endpoint
    cache.ts        localStorage stopgap described above
  context/
    AuthContext.tsx session state, login/register/logout
  components/
    ui.tsx            Button, Card, Input, Badge, EmptyState, etc.
    RockerSwitch.tsx   flag on/off control
    SignalMeter.tsx    rollout percentage display
    Layout.tsx         sidebar app shell
  pages/               one file per route
```

## Design

- **Type**: Space Grotesk (headings) / IBM Plex Sans (body) / IBM Plex Mono (keys, percentages, ids)
- **Palette**: ink (#0F1417) background, warm amber (#E8912D) as the primary
  "live signal" accent, teal for enabled/success, clay for danger/disabled
- **Signature**: the segmented signal meter + rocker switch on the feature
  flag detail page
