'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Search, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProducts, useProductModeration } from '@/features/products/hooks';
import { formatPrice } from '@/lib/utils';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<'' | 'true' | 'false'>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useProducts({
    page,
    isActive: active === '' ? undefined : active === 'true',
    search: search || undefined,
  });
  const { toggle, remove } = useProductModeration();
  const products = data?.items ?? [];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <PageHeader title="Products" description="Moderate catalog listings across all stores" />

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Select
          value={active}
          onChange={(e) => {
            setPage(1);
            setActive(e.target.value as '' | 'true' | 'false');
          }}
          className="w-40"
        >
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load products." />}

      {data && products.length === 0 && (
        <EmptyState icon={<Package className="h-10 w-10" />} title="No products match your filters" />
      )}

      {products.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Sold</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {p.images?.[0] && (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="44px" />
                          )}
                        </div>
                        <p className="line-clamp-1 font-medium">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.soldCount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? 'success' : 'muted'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={toggle.isPending}
                          onClick={() => toggle.mutate({ id: p._id, isActive: !p.isActive })}
                        >
                          {p.isActive ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate(p._id);
                          }}
                        >
                          {remove.isPending && remove.variables === p._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}
