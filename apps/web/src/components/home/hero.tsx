'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { img } from '@/lib/mock';

interface Slide {
  tag: string;
  title: ReactNode;
  sub: string;
  cta: string;
  href: string;
  seed: string;
}

const slides: Slide[] = [
  {
    tag: 'Festival Mega Sale',
    title: (
      <>
        Limited time offer
        <br />
        up to <span className="text-brand">50% off</span>
      </>
    ),
    sub: 'Redefine your everyday style.',
    cta: 'Shop the sale',
    href: '/products?sort=popular',
    seed: 'hero-fashion',
  },
  {
    tag: 'Fresh This Week',
    title: (
      <>
        New arrivals,
        <br />
        <span className="text-brand">dropped daily.</span>
      </>
    ),
    sub: 'Be the first to wear what’s next.',
    cta: 'Explore new',
    href: '/products?sort=newest',
    seed: 'hero-arrivals',
  },
  {
    tag: 'Made in Nepal',
    title: (
      <>
        Shop the country’s
        <br />
        best <span className="text-brand">local stores.</span>
      </>
    ),
    sub: 'Thousands of verified sellers, one cart.',
    cta: 'Browse stores',
    href: '/products',
    seed: 'hero-stores',
  },
];

const AUTOPLAY_MS = 6000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  const active = slides[index];

  return (
    <div
      className="relative h-full min-h-[300px] overflow-hidden rounded-2xl bg-muted md:min-h-[340px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Crossfading imagery */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <Image
            key={s.seed}
            src={img(s.seed, 1000)}
            alt=""
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority={i === 0}
            className={cn(
              'object-cover transition-opacity duration-1000 ease-out',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
        {/* Keep text legible + blend into the panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20 md:to-transparent" />
      </div>

      {/* Brand glow accents */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-navy/10 blur-3xl" />

      {/* Copy */}
      <div className="relative z-10 flex h-full flex-col justify-center p-8 md:max-w-[58%] md:p-12">
        <div key={index} className="duration-700 animate-in fade-in slide-in-from-bottom-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {active.tag}
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-[3.25rem]">
            {active.title}
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground md:text-base">{active.sub}</p>
          <Link
            href={active.href}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30"
          >
            {active.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.seed}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-7 bg-brand' : 'w-1.5 bg-foreground/20 hover:bg-foreground/40',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arrows (desktop) */}
      <div className="absolute bottom-6 right-6 z-10 hidden gap-2 md:flex">
        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
