# Redesign changelog

This documents the pass that turned the working-but-plain frontend into the
current SaaS-style app, per the brief: preserve functionality, improve UX/IA,
don't invent backend APIs.

## Preserved as-is (not touched)

- `src/context/AuthContext.tsx` — auth/session logic and API contract
- `src/lib/api.ts`, `src/lib/resources.ts` — API client and endpoint functions
- `src/types.ts` — backend response shapes
- `src/components/ProtectedRoute.tsx` (only a stale color class fixed)
- `src/main.tsx`, `vite.config.ts`, `.env` / `.env.example`
- Every route that previously existed still resolves to working UI; `/app`,
  `/app/organizations/:orgId`, `/app/organizations/:orgId/projects/:projectId`,
  `/app/feature-flags/:flagId`, and `/app/invitations` all still work — they
  now render richer content via nested tab routes instead of a single page.

## What changed

**Design system** — replaced the single dark palette with semantic tokens
(`bg`, `surface`, `border`, `fg`, `brand`, `success`, `warning`, `danger`)
that support light and dark mode, smaller border radius, no background grid
texture, GitHub/Linear-style restraint instead of the previous heavier
"control panel" look. Font swapped to Inter + IBM Plex Mono.

**Information architecture** — organization and project pages are now tabbed
(Overview / Projects / Members / Invitations / Settings, and Overview /
Feature Flags / Members / Audit / Settings respectively) via nested React
Router routes with a shared layout + `Outlet` context, instead of one long
scrolling page per entity.

**Dashboard** — now shows real counts (organizations, projects, pending
invitations) instead of just an organization list.

**Component library** — added `Table`, `Modal`, `Tabs`, `Breadcrumbs`,
`Pagination`, `SearchInput`, `Avatar`, `Skeleton`, `PageHeader`,
`UnavailableNotice`, and a toast system (`ToastContext` + `useToast`).
Forms that used to sit inline on the page now open in a modal; feedback
(success/error) now surfaces as a toast in addition to inline form errors.

**Feature flags & members** — now rendered as searchable, paginated tables
with the requested columns, rather than stacked cards.

**Navigation** — sidebar now includes an organization switcher, and a user
menu with a light/dark toggle and log out.

**Data source fix** — the previous version had no way to list organizations
or projects (`organizationApi.list/getById` and `projectApi.listByOrganization/
getById` didn't exist yet), so it worked around that with a `localStorage`
cache (`src/lib/cache.ts`). Those endpoints exist now, so the app fetches
real data everywhere and `cache.ts` was removed as dead code.

**Lazy loading** — all page components are now `React.lazy` + `Suspense`,
so route chunks are code-split (see the per-page files in the `dist/assets`
build output).

## Deliberately left alone

- **Organization-wide members list** and **Audit log** — no backend route
  exists for either. Rather than invent one, both tabs render an
  `UnavailableNotice` explaining exactly what endpoint is missing and where
  the backend logic already lives (see README "Known backend gaps").
- **Organization/Project Settings** are read-only — no `PATCH` endpoint
  exists yet for either resource.
