import Image from 'next/image';
import { img } from '@/lib/mock';

export function QuoteBanner() {
  return (
    <section className="container mt-12">
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={img('hangers-rack', 1000)}
          alt=""
          width={1200}
          height={320}
          className="h-48 w-full object-cover md:h-56"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 grid place-items-center px-6">
          <p className="text-center font-display text-2xl font-bold italic text-white md:text-3xl">
            “Where Nepal Comes to Shop”
          </p>
        </div>
      </div>
    </section>
  );
}
