import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorBanner, Field, Input } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
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
          <h1 className="font-display text-xl font-semibold text-paper mb-1">Create your account</h1>
          <p className="text-sm text-muted mb-6">Start rolling out features with confidence.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <Input
                required
                minLength={3}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
              />
            </Field>
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
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </Field>

            {error && <ErrorBanner message={error} />}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-amber hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
