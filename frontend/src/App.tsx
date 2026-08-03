import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Skeleton } from './components/ui';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Invitations = lazy(() => import('./pages/Invitations'));
const FeatureFlagDetail = lazy(() => import('./pages/FeatureFlagDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const OrganizationLayout = lazy(() => import('./pages/organization/OrganizationLayout'));
const OrganizationOverview = lazy(() => import('./pages/organization/OrganizationOverview'));
const OrganizationProjects = lazy(() => import('./pages/organization/OrganizationProjects'));
const OrganizationMembers = lazy(() => import('./pages/organization/OrganizationMembers'));
const OrganizationInvitations = lazy(() => import('./pages/organization/OrganizationInvitations'));
const OrganizationSettings = lazy(() => import('./pages/organization/OrganizationSettings'));

const ProjectLayout = lazy(() => import('./pages/project/ProjectLayout'));
const ProjectOverview = lazy(() => import('./pages/project/ProjectOverview'));
const ProjectFeatureFlags = lazy(() => import('./pages/project/ProjectFeatureFlags'));
const ProjectMembers = lazy(() => import('./pages/project/ProjectMembers'));
const ProjectAudit = lazy(() => import('./pages/project/ProjectAudit'));
const ProjectSettings = lazy(() => import('./pages/project/ProjectSettings'));

function PageFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/app" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/app" element={<Dashboard />} />
                  <Route path="/app/invitations" element={<Invitations />} />
                  <Route path="/app/feature-flags/:flagId" element={<FeatureFlagDetail />} />

                  <Route path="/app/organizations/:orgId" element={<OrganizationLayout />}>
                    <Route index element={<OrganizationOverview />} />
                    <Route path="projects" element={<OrganizationProjects />} />
                    <Route path="members" element={<OrganizationMembers />} />
                    <Route path="invitations" element={<OrganizationInvitations />} />
                    <Route path="settings" element={<OrganizationSettings />} />
                  </Route>

                  <Route path="/app/organizations/:orgId/projects/:projectId" element={<ProjectLayout />}>
                    <Route index element={<ProjectOverview />} />
                    <Route path="feature-flags" element={<ProjectFeatureFlags />} />
                    <Route path="members" element={<ProjectMembers />} />
                    <Route path="audit" element={<ProjectAudit />} />
                    <Route path="settings" element={<ProjectSettings />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
