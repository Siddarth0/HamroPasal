'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { ApiProduct, ApiVariant, ApiAttribute, ProductInput } from '@/features/products/api';
import { useCreateProduct, useUpdateProduct } from '@/features/products/hooks';
import { fetchCategories } from '@/features/categories/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api';

/* ---- Local editor state (looser than the wire payload) ---- */

interface VariantDraft {
  name: string;
  price: string;
  comparePrice: string;
  stock: string;
  sku: string;
  attrs: { key: string; value: string }[];
}

const emptyVariant = (): VariantDraft => ({
  name: '',
  price: '',
  comparePrice: '',
  stock: '0',
  sku: '',
  attrs: [],
});

const toVariantDraft = (v: ApiVariant): VariantDraft => ({
  name: v.name,
  price: String(v.price),
  comparePrice: v.comparePrice != null ? String(v.comparePrice) : '',
  stock: String(v.stock),
  sku: v.sku ?? '',
  attrs: Object.entries(v.attributes ?? {}).map(([key, value]) => ({ key, value })),
});

export function ProductForm({ product }: { product?: ApiProduct }) {
  const router = useRouter();
  const isEdit = !!product;
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [comparePrice, setComparePrice] = useState(
    product?.comparePrice != null ? String(product.comparePrice) : '',
  );
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [tags, setTags] = useState((product?.tags ?? []).join(', '));
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [attributes, setAttributes] = useState<{ name: string; values: string }[]>(
    (product?.attributes ?? []).map((a) => ({ name: a.name, values: a.values.join(', ') })),
  );
  const [variants, setVariants] = useState<VariantDraft[]>(
    (product?.variants ?? []).map(toVariantDraft),
  );
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const saving = create.isPending || update.isPending;

  const buildPayload = (): ProductInput | null => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Product name must be at least 2 characters.');
      return null;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return null;
    }
    if (!categoryId) {
      setError('Pick a category.');
      return null;
    }
    const priceNum = Number(price);
    if (!(priceNum >= 0) || price === '') {
      setError('Enter a valid price.');
      return null;
    }

    const cleanAttributes: ApiAttribute[] = attributes
      .map((a) => ({
        name: a.name.trim(),
        values: a.values
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((a) => a.name && a.values.length > 0);

    const cleanVariants: ApiVariant[] = variants.map((v) => ({
      name: v.name.trim(),
      price: Number(v.price) || 0,
      comparePrice: v.comparePrice !== '' ? Number(v.comparePrice) : undefined,
      stock: Number(v.stock) || 0,
      sku: v.sku.trim() || undefined,
      attributes: Object.fromEntries(
        v.attrs.filter((p) => p.key.trim() && p.value.trim()).map((p) => [p.key.trim(), p.value.trim()]),
      ),
    }));

    if (cleanVariants.some((v) => !v.name)) {
      setError('Every variant needs a name.');
      return null;
    }

    return {
      name: name.trim(),
      description: description.trim(),
      categoryId,
      price: priceNum,
      comparePrice: comparePrice !== '' ? Number(comparePrice) : undefined,
      stock: Number(stock) || 0,
      sku: sku.trim() || undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      attributes: cleanAttributes,
      variants: cleanVariants,
      isActive,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    const payload = buildPayload();
    if (!payload) return;

    try {
      if (isEdit && product) {
        await update.mutateAsync({ id: product._id, input: payload });
        setDone(true);
      } else {
        const created = await create.mutateAsync(payload);
        router.replace(`/products/${created._id}?created=1`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save product'));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {done && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Product saved.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pname">Name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pdesc">Description</Label>
            <Textarea
              id="pdesc"
              className="min-h-[140px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pcat">Category</Label>
              <Select id="pcat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select a category…</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ptags">Tags (comma separated)</Label>
              <Input
                id="ptags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="handmade, cotton"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="pprice">Price (Rs.)</Label>
              <Input
                id="pprice"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pcompare">Compare-at (Rs.)</Label>
              <Input
                id="pcompare"
                type="number"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pstock">Stock</Label>
              <Input
                id="pstock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="psku">SKU</Label>
              <Input id="psku" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
          </div>
          {variants.length > 0 && (
            <p className="text-xs text-muted-foreground">
              This product has variants — the base price/stock above act as a fallback; shoppers buy
              a specific variant.
            </p>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Active (visible to shoppers when your store is approved)
          </label>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attributes</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAttributes((a) => [...a, { name: '', values: '' }])}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {attributes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Optional. e.g. Color → Red, Blue · Size → S, M, L
            </p>
          )}
          {attributes.map((attr, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Name (e.g. Color)"
                value={attr.name}
                onChange={(e) =>
                  setAttributes((a) =>
                    a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                  )
                }
                className="w-1/3"
              />
              <Input
                placeholder="Values, comma separated"
                value={attr.values}
                onChange={(e) =>
                  setAttributes((a) =>
                    a.map((x, j) => (j === i ? { ...x, values: e.target.value } : x)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAttributes((a) => a.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variants</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVariants((v) => [...v, emptyVariant()])}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Optional. Add variants (e.g. &quot;Red / Large&quot;) with their own price &amp; stock.
            </p>
          )}
          {variants.map((v, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Variant {i + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  placeholder="Variant name"
                  value={v.name}
                  onChange={(e) =>
                    setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) =>
                    setVariants((vs) =>
                      vs.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)),
                    )
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) =>
                    setVariants((vs) =>
                      vs.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)),
                    )
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Compare-at (optional)"
                  value={v.comparePrice}
                  onChange={(e) =>
                    setVariants((vs) =>
                      vs.map((x, j) => (j === i ? { ...x, comparePrice: e.target.value } : x)),
                    )
                  }
                />
                <Input
                  placeholder="SKU (optional)"
                  value={v.sku}
                  onChange={(e) =>
                    setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="brand" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
