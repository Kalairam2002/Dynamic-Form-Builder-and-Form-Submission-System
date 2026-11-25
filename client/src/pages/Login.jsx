import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Logo from '../components/Logo';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, status, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.from || '/';
  const isLoading = status === 'loading';

  if (token) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate(redirectTo, { replace: true });
  }

  return (
    <main className="flex items-center justify-center px-4 py-12 min-h-screen">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Card className="sm:p-8">
          <h1 className="mb-6 text-xl font-semibold text-center text-gray-900">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Alert>{error}</Alert>

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
