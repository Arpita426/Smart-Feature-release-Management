# Rollout — frontend for the Feature Release Management API

React + TypeScript + Tailwind v4 + Vite. A multi-tenant feature flag console
(organizations → projects → feature flags), styled in the vein of
GitHub/Linear/Vercel: dark-first, small radius, semantic status color, no
flashy chrome.

## Run it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. In dev, API calls to `/api/*` are proxied to
`http://localhost:5000` (see `vite.config.ts`). Point `VITE_API_BASE_URL` in
`.env` at a different host if your backend runs elsewhere, or for a
production build where there's no dev proxy.

## What's built

- **Auth** — register, login, session persisted via JWT, auto-redirect to login on 401
- **Dashboard** — organization/project/pending-invitation counts, organization grid
- **Organizations** — tabs for Overview, Projects, Members, Invitations, Settings
- **Projects** — tabs for Overview, Feature Flags, Members, Audit, Settings
- **Feature flags** — searchable/paginated table, detail page with toggle, rollout slider, delete
- **Members** — table with avatar, role select, remove, search (at the project level)
- **Invitations** — status-filterable table, both org-level (sent) and personal (received)
- **Org switcher, breadcrumbs, user menu, light/dark theme toggle**
- **Toasts, skeleton loading states, modals, reusable Table/Tabs/Pagination**

The rollout percentage renders as a 20-segment "signal meter" and the
enable/disable control is a rocker switch — a deliberate signature choice
over a generic progress bar / iOS toggle, kept from the previous version and
restyled to match the new palette.

## Known backend gaps

Two things the UI surfaces honestly rather than faking:

- **Organization members** (`Organization → Members` tab) — the backend has an
  `organization-member` model/service but no HTTP route exposing a list.
  Add `GET /api/v1/organizations/:id/members` to power this tab.
- **Audit log** (`Project → Audit` tab) — the backend already records audit
  entries (`src/audit/audit.model.ts`, `audit.repository.ts`) but nothing
  exposes them over HTTP. Add something like
  `GET /api/v1/projects/:id/audit` backed by `AuditRepository.findByEntity`.

Both tabs render a clear in-app notice explaining this rather than showing
fabricated data — no backend API was invented to fill them in.

Organization/Project Settings tabs are read-only for the same reason: there's
no `PATCH /api/v1/organizations/:id` or `PATCH /api/v1/projects/:id` yet.

Everything else (auth, org/project CRUD + listing, invitations, project
members, feature flags) is wired to real endpoints — see `src/lib/resources.ts`
for the exact calls.

## Project structure

```
src/
  lib/
    api.ts             axios instance, JWT header injection, id normalization
    resources.ts        one function per backend endpoint
  context/
    AuthContext.tsx     session state, login/register/logout
    ThemeContext.tsx     light/dark mode, persisted
    ToastContext.tsx     toast notifications
  components/
    ui.tsx               Button, Card, Input, Badge, Avatar, Skeleton, EmptyState, etc.
    Table.tsx, Tabs.tsx, Modal.tsx, Pagination.tsx, Breadcrumbs.tsx
    Layout.tsx            sidebar app shell + user menu
    OrgSwitcher.tsx
    RockerSwitch.tsx, SignalMeter.tsx   signature flag controls
  pages/
    Login.tsx, Register.tsx, Dashboard.tsx, Invitations.tsx, FeatureFlagDetail.tsx, NotFound.tsx
    organization/         OrganizationLayout + 5 tab pages
    project/               ProjectLayout + 5 tab pages
```

Pages are code-split with `React.lazy` — see `App.tsx`.

## Design

- **Type**: Inter (UI) / IBM Plex Mono (keys, ids, percentages, timestamps)
- **Palette**: semantic tokens (`bg`, `surface`, `border`, `fg`, `brand`,
  `success`, `warning`, `danger`) defined once in `src/index.css` and
  swapped via `[data-theme]` for light/dark — see `@theme` block
- **Signature**: segmented signal meter + rocker switch on the feature flag detail page
