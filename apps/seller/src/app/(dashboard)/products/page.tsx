'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { NoStorePrompt } from '@/components/shared/no-store';
import { Pagination } from '@/components/shared/pagination';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMyStore } from '@/features/store/hooks';
import { useMyProducts, useDeleteProduct } from '@/features/products/hooks';
import { formatPrice } from '@/lib/utils';

export default function ProductsPage() {
  const { data: store, isLoading: storeLoading } = useMyStore();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useMyProducts({ page, search: search || undefined });
  const del = useDeleteProduct();

  if (storeLoading) return <LoadingBlock />;
  if (!store) {
    return (
      <>
        <PageHeader title="Products" />
        <NoStorePrompt />
      </>
    );
  }

  const products = data?.items ?? [];

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your catalog"
        action={
          <Button asChild variant="brand">
            <Link href="/products/new">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </Button>
        }
      />

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load products." />}

      {data && products.length === 0 && (
        <EmptyState
          icon={<Package className="h-10 w-10" />}
          title={search ? 'No products match your search' : 'No products yet'}
          description={
            search ? 'Try a different search term.' : 'Add your first product to start selling.'
          }
          action={
            !search && (
              <Button asChild variant="brand">
                <Link href="/products/new">Add product</Link>
              </Button>
            )
          }
        />
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
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          )}
                        </div>
                        <div>
                          <p className="line-clamp-1 font-medium">{p.name}</p>
                          {p.variants.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
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
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="Edit">
                          <Link href={`/products/${p._id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          disabled={del.isPending}
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"? This cannot be undone.`))
                              del.mutate(p._id);
                          }}
                        >
                          {del.isPending && del.variables === p._id ? (
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
