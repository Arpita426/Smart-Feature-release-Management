import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorBanner, Field, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string })?.from || '/app';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Radio className="h-6 w-6 text-amber" strokeWidth={2.25} />
          <span className="font-display font-semibold text-lg text-paper">Rollout</span>
        </div>

        <Card className="p-6">
          <h1 className="font-display text-xl font-semibold text-paper mb-1">Sign in</h1>
          <p className="text-sm text-muted mb-6">Manage your feature releases.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && <ErrorBanner message={error} />}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-5">
          No account yet?{' '}
          <Link to="/register" className="text-amber hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
