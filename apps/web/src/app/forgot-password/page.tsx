'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell, FieldError, FormAlert } from '@/components/auth/auth-shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPassword } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await forgotPassword(v.email);
      setSentTo(v.email);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we’ll send you a code to reset your password."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {error && <FormAlert kind="error">{error}</FormAlert>}
      {sentTo ? (
        <FormAlert kind="success">
          If an account exists for {sentTo}, a reset code has been sent.{' '}
          <Link
            href={`/reset-password?email=${encodeURIComponent(sentTo)}`}
            className="font-semibold underline"
          >
            Enter the code →
          </Link>
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
