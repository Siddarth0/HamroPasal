import Link from 'next/link';

/** Reusable navy hero band for content/legal pages, with a breadcrumb. */
export function ContentHero({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="container relative py-12 md:py-16">
        <nav className="text-xs text-white/50">
          <Link href="/" className="hover:text-white">
            Home
          </Link>{' '}
          / <span className="text-white/80">{eyebrow ?? title}</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
