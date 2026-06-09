'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell, FieldError, FormAlert } from '@/components/auth/auth-shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resetPassword } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  password: z.string().min(8, 'At least 8 characters'),
});
type Values = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get('email') ?? '', otp: '', password: '' },
  });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await resetPassword(v);
      router.replace('/login?reset=1');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid or expired code'));
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the code we emailed you and choose a new password."
      footer={
        <>
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {error && <FormAlert kind="error">{error}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="otp">Reset code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            className="tracking-[0.5em]"
            {...register('otp')}
          />
          <FieldError message={errors.otp?.message} />
        </div>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
