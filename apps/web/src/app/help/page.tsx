import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, CreditCard, Truck, RotateCcw, User, Store, ChevronDown, Mail } from 'lucide-react';
import { ContentHero } from '@/components/content/content-hero';
import { SELLER_URL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'Help Center — HamroPasal',
  description: 'Answers to common questions about ordering, payment, delivery, returns and selling on HamroPasal.',
};

const faqs: { icon: typeof ShoppingCart; topic: string; qa: { q: string; a: string }[] }[] = [
  {
    icon: ShoppingCart,
    topic: 'Ordering',
    qa: [
      { q: 'How do I place an order?', a: 'Browse or search for a product, choose any options (size, colour, etc.), add it to your cart, then go to checkout. You’ll need to be logged in with a verified email to complete a purchase.' },
      { q: 'Do I need an account to buy?', a: 'Yes — you can browse freely, but adding items to your cart and checking out requires a free account with a verified email address.' },
      { q: 'Can I buy from multiple sellers at once?', a: 'Absolutely. Your cart groups items by store and we calculate shipping per seller, so you can check out everything in one go.' },
    ],
  },
  {
    icon: CreditCard,
    topic: 'Payment',
    qa: [
      { q: 'What payment methods do you accept?', a: 'Cash on Delivery (COD), eSewa, Khalti, and debit/credit cards. Choose your preferred method at checkout.' },
      { q: 'Is online payment secure?', a: 'Yes. Card and wallet payments are processed by the gateway directly and verified server-side — we never store your card details.' },
      { q: 'Can I use a coupon or loyalty points?', a: 'Yes. Enter a valid coupon code and/or redeem your loyalty points on the checkout page; the discount is applied to your order total.' },
    ],
  },
  {
    icon: Truck,
    topic: 'Delivery',
    qa: [
      { q: 'How is the delivery fee calculated?', a: 'Each seller sets delivery zones by distance. We measure the distance from the store to your address and apply that store’s fee for the matching zone.' },
      { q: 'How do I track my order?', a: 'Go to My Orders in your account. Each order shows a live status timeline as the seller confirms, processes, ships and delivers it.' },
      { q: 'Why is an item “unavailable” in my cart?', a: 'It may have gone out of stock or the store may be temporarily inactive. Remove it to continue checking out the rest of your cart.' },
    ],
  },
  {
    icon: RotateCcw,
    topic: 'Returns & refunds',
    qa: [
      { q: 'Can I return an item?', a: 'You can request a return on a delivered item from My Orders. The seller reviews the request and, once approved and completed, the order is marked refunded.' },
      { q: 'How long do refunds take?', a: 'After a return is completed, refunds are processed back through your original payment method or arranged with the seller for COD orders.' },
    ],
  },
  {
    icon: User,
    topic: 'Account',
    qa: [
      { q: 'How do I verify my email?', a: 'After signing up we email you a 6-digit code. Enter it on the verification page to unlock checkout. You can resend the code if it expires.' },
      { q: 'I forgot my password.', a: 'Use “Forgot password” on the login page. We’ll email you a reset code to set a new password.' },
    ],
  },
  {
    icon: Store,
    topic: 'Selling',
    qa: [
      { q: 'How do I start selling?', a: 'Head to the Seller Center, create a seller account and submit your store for approval. Once an admin approves it, your products go live.' },
      { q: 'What are the fees?', a: 'It’s free to open a store. HamroPasal takes a small commission on each delivered order; the rest is your earning, paid out via the payouts system.' },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <ContentHero
        title="Help Center"
        subtitle="Find quick answers below — or reach our support team if you need a hand."
      />

      <section className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {faqs.map(({ icon: Icon, topic, qa }) => (
              <div key={topic}>
                <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  {topic}
                </h2>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                  {qa.map(({ q, a }) => (
                    <details key={q} className="group">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 text-sm font-medium marker:content-none hover:bg-muted/50">
                        {q}
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="px-5 pb-4 text-sm text-muted-foreground">{a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar: contact + seller */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-6">
              <Mail className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-display text-lg font-bold">Still need help?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our support team typically replies within a few hours.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
              >
                Contact support
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Store className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-display text-lg font-bold">Selling on HamroPasal?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your store, orders and payouts in the Seller Center.
              </p>
              <a
                href={SELLER_URL}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Open Seller Center
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
