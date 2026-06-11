import type { Metadata } from 'next';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, Users, Heart, ArrowRight } from 'lucide-react';
import { ContentHero } from '@/components/content/content-hero';
import { SELLER_URL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'About Us — HamroPasal',
  description: 'HamroPasal is Nepal’s multi-vendor marketplace connecting local sellers with shoppers nationwide.',
};

const stats = [
  { value: '1,000+', label: 'Local sellers' },
  { value: '50,000+', label: 'Products listed' },
  { value: '70+', label: 'Districts served' },
  { value: '4.8★', label: 'Avg. buyer rating' },
];

const values = [
  { icon: Store, title: 'Empowering local sellers', body: 'We give every Nepali business — from Thamel boutiques to home-grown brands — the tools to reach customers across the country.' },
  { icon: ShieldCheck, title: 'Shop with confidence', body: 'Verified stores, secure payments (eSewa, Khalti, cards or cash on delivery) and a fair returns policy on every order.' },
  { icon: Truck, title: 'Delivered to your door', body: 'Distance-based delivery from sellers near you means faster shipping and fairer fees, valley to hills.' },
  { icon: Heart, title: 'Built for Nepal', body: 'Prices in rupees, local payment methods and support that understands how Nepal shops.' },
];

export default function AboutPage() {
  return (
    <>
      <ContentHero
        title="About HamroPasal"
        subtitle="Nepal’s online marketplace — bringing thousands of trusted local sellers and shoppers together in one place."
      />

      <section className="container py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Our story</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                HamroPasal began with a simple idea: shopping in Nepal should be as easy as walking
                into your neighbourhood store — but with the whole country’s selection at your
                fingertips. Too many great local sellers had no way to reach customers beyond their
                street, and too many shoppers couldn’t find what they wanted close to home.
              </p>
              <p>
                So we built a marketplace where any seller can open a store in minutes, list their
                products, and sell to customers from Kathmandu to Karnali — while shoppers get one
                trusted place to browse, compare and buy, with payment and delivery options that
                actually work in Nepal.
              </p>
              <p>
                Today HamroPasal is home to a growing community of sellers and shoppers, and we’re
                just getting started.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="font-display text-3xl font-bold text-brand">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-center font-display text-2xl font-bold">What we stand for</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-muted p-8">
            <Users className="h-7 w-7 text-brand" />
            <h3 className="font-display text-xl font-bold">Start shopping</h3>
            <p className="text-sm text-muted-foreground">
              Discover thousands of products from sellers across Nepal.
            </p>
            <Link
              href="/products"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
            >
              Browse products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-navy p-8 text-white">
            <Store className="h-7 w-7 text-brand" />
            <h3 className="font-display text-xl font-bold">Sell on HamroPasal</h3>
            <p className="text-sm text-white/70">
              Open your store and reach customers nationwide. It’s free to get started.
            </p>
            <a
              href={SELLER_URL}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
            >
              Become a seller <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
