import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizationDetail from './pages/OrganizationDetail';
import ProjectDetail from './pages/ProjectDetail';
import FeatureFlagDetail from './pages/FeatureFlagDetail';
import Invitations from './pages/Invitations';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/organizations/:orgId" element={<OrganizationDetail />} />
            <Route path="/app/organizations/:orgId/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/app/feature-flags/:flagId" element={<FeatureFlagDetail />} />
            <Route path="/app/invitations" element={<Invitations />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
