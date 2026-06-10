'use client';

import { useState } from 'react';
import { FolderTree, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { CategoryCard } from '@/components/categories/category-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useCategories, useCategoryMutations } from '@/features/categories/hooks';
import { getApiErrorMessage } from '@/lib/api';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const { create } = useCategoryMutations();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        sortOrder: sortOrder !== '' ? Number(sortOrder) : undefined,
      });
      setName('');
      setDescription('');
      setParentId('');
      setSortOrder('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create category'));
    }
  };

  return (
    <>
      <PageHeader title="Categories" description="Organize the product catalog" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>New category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
              <div>
                <Label htmlFor="cname">Name</Label>
                <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Electronics" />
              </div>
              <div>
                <Label htmlFor="cparent">Parent (optional)</Label>
                <Select id="cparent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">None (top-level)</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="csort">Sort order (optional)</Label>
                <Input
                  id="csort"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="cdesc">Description (optional)</Label>
                <Textarea
                  id="cdesc"
                  className="min-h-[72px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" variant="brand" className="w-full" disabled={create.isPending}>
                {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create category
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          {isLoading && <LoadingBlock />}
          {isError && <ErrorBlock message="Could not load categories." />}
          {categories && categories.length === 0 && (
            <EmptyState
              icon={<FolderTree className="h-10 w-10" />}
              title="No categories yet"
              description="Create your first category to organize products."
            />
          )}
          {categories && categories.length > 0 && (
            <div className="space-y-3">
              {categories.map((c) => (
                <CategoryCard key={c._id} category={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
