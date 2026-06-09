'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { updateProfile } from '@/features/account/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/auth/auth-shell';
import { getApiErrorMessage } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(7, 'Enter a valid phone').or(z.literal('')),
});
type Values = z.infer<typeof schema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  if (!user) return null;

  const submit = async (v: Values) => {
    setError(null);
    setMsg(null);
    try {
      const updated = await updateProfile({ name: v.name, phone: v.phone || undefined });
      setUser(updated);
      setMsg('Profile updated');
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold">Profile</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-3">
              <Input id="email" value={user.email} disabled className="bg-muted/50" />
              {user.isEmailVerified ? (
                <span className="flex shrink-0 items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </span>
              ) : (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(user.email)}`}
                  className="flex shrink-0 items-center gap-1 text-xs text-brand hover:underline"
                >
                  <AlertCircle className="h-4 w-4" /> Verify
                </Link>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="98XXXXXXXX" {...register('phone')} />
            <FieldError message={errors.phone?.message} />
          </div>
          {error && <p className="text-sm text-brand">{error}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
