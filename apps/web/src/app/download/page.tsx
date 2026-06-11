'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Apple, Play, ShoppingBag, Search, Heart, Sparkles, Check, Bell } from 'lucide-react';

/* A stylized mockup of the upcoming app — pure CSS, on-brand. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px]">
      <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-brand/15 blur-3xl" />
      <div className="relative rounded-[2.6rem] border-[10px] border-navy bg-navy shadow-2xl">
        <div className="overflow-hidden rounded-[1.9rem] bg-muted/40">
          {/* status bar */}
          <div className="flex items-center justify-between bg-navy px-5 py-2 text-[10px] text-white/70">
            <span>9:41</span>
            <span className="flex gap-1">
              <span className="h-2 w-3 rounded-sm bg-white/40" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
            </span>
          </div>
          {/* app header */}
          <div className="flex items-center gap-2 bg-background px-3 py-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-brand-foreground">
              <ShoppingBag className="h-3.5 w-3.5" />
            </span>
            <span className="font-script text-sm font-bold text-navy">HamroPasal</span>
            <span className="ml-auto flex gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          {/* search */}
          <div className="bg-background px-3 pb-2">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-[10px] text-muted-foreground">
              <Search className="h-3 w-3" /> Search products…
            </div>
          </div>
          {/* hero */}
          <div className="mx-3 mb-3 flex h-20 items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-navy to-brand px-3 text-white">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-white/70">Festival sale</p>
              <p className="font-display text-base font-bold leading-tight">50% OFF</p>
            </div>
            <Sparkles className="h-7 w-7 text-white/80" />
          </div>
          {/* categories */}
          <div className="flex justify-between px-3 pb-3">
            {['bg-rose-200', 'bg-sky-200', 'bg-amber-200', 'bg-emerald-200'].map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className={`h-9 w-9 rounded-full ${c}`} />
                <span className="h-1.5 w-7 rounded-full bg-muted" />
              </div>
            ))}
          </div>
          {/* product grid */}
          <div className="grid grid-cols-2 gap-2 px-3 pb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="aspect-square bg-muted" />
                <div className="space-y-1 p-1.5">
                  <span className="block h-1.5 w-full rounded bg-muted" />
                  <span className="block h-2.5 w-10 rounded bg-brand/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="bg-muted/30">
      {/* Coming soon banner */}
      <div className="bg-brand text-center text-sm font-semibold text-brand-foreground">
        <div className="container py-2">📱 The HamroPasal app is coming soon — be the first to know.</div>
      </div>

      <section className="container grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Coming soon
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
            Shop Nepal from
            <br />
            your <span className="text-brand">pocket.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            The HamroPasal app is on its way — faster checkout, order tracking, exclusive app-only
            deals and instant chat with sellers. Drop your email and we’ll notify you the moment it
            launches.
          </p>

          {done ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <Check className="h-5 w-5" /> You’re on the list! We’ll be in touch.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setDone(true);
              }}
              className="mt-6 flex max-w-md gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
              >
                <Bell className="h-4 w-4" /> Notify me
              </button>
            </form>
          )}

          {/* Store badges (coming soon) */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: Apple, top: 'Coming soon on', store: 'App Store' },
              { icon: Play, top: 'Coming soon on', store: 'Google Play' },
            ].map(({ icon: Icon, top, store }) => (
              <div
                key={store}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 opacity-70"
              >
                <Icon className="h-6 w-6" />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] text-muted-foreground">{top}</span>
                  <span className="block text-sm font-semibold">{store}</span>
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Can’t wait?{' '}
            <Link href="/products" className="font-medium text-brand hover:underline">
              Shop on the web →
            </Link>
          </p>
        </div>

        <PhoneMockup />
      </section>
    </div>
  );
}
