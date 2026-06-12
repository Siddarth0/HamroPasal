'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell, FieldError, FormAlert } from '@/components/auth/auth-shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyEmail, resendVerification, getMe } from '@/features/auth/api';
import { useAuthStore } from '@/store/auth';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
type Values = z.infer<typeof schema>;

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resentMsg, setResentMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get('email') ?? user?.email ?? '', otp: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await verifyEmail(v);
      // Refresh the in-memory user so the "Verify" badge clears immediately
      // (the DB is now verified; without this the SPA keeps the stale value).
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        /* not logged in on this device — will reflect on next login */
      }
      router.replace('/');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid or expired code'));
    }
  };

  const onResend = async () => {
    setError(null);
    setResentMsg(null);
    const email = getValues('email');
    if (!email) {
      setError('Enter your email first');
      return;
    }
    try {
      await resendVerification(email);
      setResentMsg('A new code has been sent if an account exists for that email.');
      setCooldown(30);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="We sent a 6-digit code to your inbox. Enter it below to verify your account."
    >
      {error && <FormAlert kind="error">{error}</FormAlert>}
      {resentMsg && <FormAlert kind="success">{resentMsg}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="otp">Verification code</Label>
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
        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-muted-foreground">
        Didn’t get the code?{' '}
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0}
          className="font-semibold text-brand hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
