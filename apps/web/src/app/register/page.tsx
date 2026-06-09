'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell, FieldError, FormAlert } from '@/components/auth/auth-shell';
import { GoogleButton } from '@/components/auth/google-button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { register as registerUser } from '@/features/auth/api';
import { useAuthStore } from '@/store/auth';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\-\s]{7,15}$/.test(v), 'Enter a valid phone number'),
  password: z.string().min(8, 'At least 8 characters'),
});
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      const { user, accessToken } = await registerUser({
        name: v.name,
        email: v.email,
        password: v.password,
        phone: v.phone || undefined,
        role: 'CUSTOMER',
      });
      setAuth(user, accessToken);
      router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not create your account'));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join HamroPasal to shop from thousands of local sellers."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && <FormAlert kind="error">{error}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...register('name')} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton label="Sign up with Google" />
    </AuthShell>
  );
}
