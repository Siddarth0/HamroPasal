import { HeroBanner } from '@/components/home/hero';
import { CategorySidebar } from '@/components/home/category-sidebar';
import { CategoryCircles } from '@/components/home/category-circles';
import { FlashSale } from '@/components/home/flash-sale';
import { TodaysForYou } from '@/components/home/todays-for-you';
import { BestSellingStore } from '@/components/home/best-selling-store';
import { QuoteBanner } from '@/components/home/quote-banner';

export default function HomePage() {
  return (
    <>
      {/* Daraz-style: category sidebar + hero */}
      <section className="container pt-6">
        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <CategorySidebar className="hidden lg:block" />
          <HeroBanner />
        </div>
      </section>

      <CategoryCircles />
      <FlashSale />
      <TodaysForYou />
      <BestSellingStore />
      <QuoteBanner />
      <div className="h-6" />
    </>
  );
}
