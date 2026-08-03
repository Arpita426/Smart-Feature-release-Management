import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-mono text-amber text-sm mb-2">404</p>
      <h1 className="font-display text-2xl font-semibold text-paper mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/app">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
