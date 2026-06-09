import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { img } from '@/lib/mock';
import { Button } from '@/components/ui/button';

export function HeroBanner() {
  return (
    <div className="h-full overflow-hidden rounded-2xl bg-muted">
      <div className="grid h-full items-center md:grid-cols-2">
        <div className="p-8 md:p-10">
          <p className="text-sm font-semibold text-brand">#Festival Mega Sale</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-[1.1] md:text-5xl">
            Limited Time Offer!
            <br />
            Up to <span className="text-brand">50% OFF!</span>
          </h1>
          <p className="mt-4 text-muted-foreground">Redefine Your Everyday Style</p>
          <Button variant="brand" className="mt-6 gap-2">
            Shop now
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="mt-7 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === 1 ? 'w-6 bg-brand' : 'w-1.5 bg-foreground/20',
                )}
              />
            ))}
          </div>
        </div>
        <div className="relative h-48 md:h-full md:min-h-[320px]">
          <Image
            src={img('hero-fashion', 800)}
            alt="Festival mega sale"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
