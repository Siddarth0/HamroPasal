import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'All Categories — Shop by Category in Nepal',
  description:
    'Explore all product categories on HamroPasal — fashion, electronics, home, beauty and more. Find what you need from local sellers across Nepal.',
  path: '/categories',
  keywords: ['shop by category Nepal', 'product categories Nepal', 'online categories'],
});

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
