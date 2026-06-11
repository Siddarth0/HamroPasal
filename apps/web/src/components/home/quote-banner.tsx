import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { img } from '@/lib/mock';

export function QuoteBanner() {
  return (
    <section className="container mt-12">
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={img('hangers-rack', 1200)}
          alt=""
          width={1200}
          height={360}
          className="h-56 w-full object-cover md:h-64"
        />
        {/* Navy wash for a premium, on-brand feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/30" />
        {/* Decorative grain-free brand glow */}
        <div className="pointer-events-none absolute -right-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" />

        <div className="absolute inset-0 flex flex-col justify-center gap-4 px-8 md:px-14">
          <Quote className="h-8 w-8 text-brand" fill="currentColor" />
          <p className="max-w-lg font-script text-3xl font-bold leading-tight text-white md:text-5xl">
            Where Nepal comes to shop.
          </p>
          <Link
            href="/products"
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-brand"
          >
            Discover the marketplace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
