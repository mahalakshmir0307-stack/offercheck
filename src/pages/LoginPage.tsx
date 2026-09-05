import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TreePine, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = isSignup
      ? await signUp(email, password)
      : await signIn(email, password);
    setLoading(false);
    if (error) {
      let friendly = error;
      if (error.includes('user_already_exists')) friendly = 'An account with this email already exists. Try signing in instead.';
      else if (error.includes('weak_password')) friendly = 'This password is too common. Please choose a stronger password.';
      else if (error.includes('Invalid login')) friendly = 'Incorrect email or password. Please try again.';
      setError(friendly);
    } else if (isSignup) {
      setError(null);
      navigate('/dashboard');
    } else {
      navigate(from);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-100 via-white to-amber-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-amber-700 flex items-center justify-center shadow-md">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold text-charcoal-900 tracking-tight">WoodValue</span>
            <p className="text-xs text-charcoal-500 -mt-0.5">Sawmill Reuse System</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-charcoal-200 shadow-lg p-8">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-charcoal-600 mb-6">
            {isSignup
              ? 'Sign up to start managing your leftover wood.'
              : 'Sign in to your sawmill account to continue.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sawmill.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-charcoal-600">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(null); }}
              className="font-semibold text-amber-700 hover:text-amber-800"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-charcoal-400">
          <TreePine className="w-3.5 h-3.5" />
          WoodValue — Get more value from reusable leftover wood
        </div>
      </div>
    </div>
  );
}
