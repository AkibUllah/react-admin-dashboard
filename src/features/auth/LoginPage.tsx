import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from './loginSchema';
import type { LoginForm } from './loginSchema';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { login } from '@/api/queries';
import { ApiError } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { env } from '@/lib/env';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const authenticated = useAuthStore((s) => s.isAuthenticated());
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@shopbd.test', password: 'password123' },
  });

  if (authenticated) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { token, user } = await login(values);
      setSession(token, user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not reach the server';
      setError('root', { message });
    }
  });

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Store className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{env.appName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to the back office</p>
          </div>
        </div>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Input label="Email" type="email" autoComplete="username" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
          {errors.root?.message && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>
        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">Demo accounts (password: password123)</p>
          <ul className="mt-1 space-y-0.5">
            <li>admin@shopbd.test · admin</li>
            <li>manager@shopbd.test · manager</li>
            <li>support@shopbd.test · support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
