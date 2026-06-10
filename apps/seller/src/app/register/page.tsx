'use client';

import { useState } from 'react';
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
import { registerSeller } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone').optional().or(z.literal('')),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { user, accessToken } = await registerSeller({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      setAuth(user, accessToken);
      // Send straight to store setup — they need a store before listing products.
      router.replace('/store');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create account'));
    }
  });

  return (
    <AuthShell title="Become a seller" subtitle="Set up your HamroPasal store in minutes">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Sita Sharma" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" placeholder="98XXXXXXXX" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
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
          Create seller account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a seller?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
