'use client';

import { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Check, Send } from 'lucide-react';
import { ContentHero } from '@/components/content/content-hero';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '@/lib/links';

const channels = [
  { icon: Mail, label: 'Email us', value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: Phone, label: 'Call us', value: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE.replace(/\s/g, '')}` },
  { icon: Clock, label: 'Hours', value: 'Sun–Fri, 9am – 6pm NPT' },
  { icon: MapPin, label: 'Office', value: 'Kathmandu, Nepal' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <ContentHero
        title="Contact support"
        subtitle="Have a question or an issue with an order? Send us a message and we’ll get back to you."
      />

      <section className="container grid gap-10 py-12 lg:grid-cols-[320px_1fr]">
        {/* Channels */}
        <div className="space-y-3">
          {channels.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">{label}</span>
                  <span className="block text-sm font-semibold">{value}</span>
                </span>
              </div>
            );
            return href ? (
              <a key={label} href={href} className="block">
                {inner}
              </a>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-7 w-7" />
              </span>
              <h2 className="font-display text-xl font-bold">Message sent</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Thanks, {form.name || 'there'}! Our team will reply to {form.email || 'your email'}{' '}
                shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl font-bold">Send us a message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={set('name')}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Subject</label>
                <input
                  required
                  value={form.subject}
                  onChange={set('subject')}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Message</label>
                <textarea
                  required
                  value={form.message}
                  onChange={set('message')}
                  rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
              >
                <Send className="h-4 w-4" /> Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
