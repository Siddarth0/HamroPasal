'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { login } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);

  // If a seller session is already live, skip the form.
  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'SELLER') router.replace('/');
  }, [status, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { user: u, accessToken } = await login(values);
      if (u.role !== 'SELLER') {
        setError('This account is not a seller account. Use the customer site to shop.');
        return;
      }
      setAuth(u, accessToken);
      router.replace('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not sign in'));
    }
  });

  return (
    <AuthShell title="Seller sign in" subtitle="Manage your HamroPasal store">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New seller?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
