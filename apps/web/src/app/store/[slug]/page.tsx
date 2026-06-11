import { StorePage } from '@/components/store/store-page';

export default function Page({ params }: { params: { slug: string } }) {
  return <StorePage slug={params.slug} />;
}
