'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2, Pencil } from 'lucide-react';
import type { AdminCategory } from '@/features/categories/api';
import { useCategoryMutations } from '@/features/categories/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getApiErrorMessage } from '@/lib/api';

export function CategoryCard({ category }: { category: AdminCategory }) {
  const { update, remove, uploadImage } = useCategoryMutations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [error, setError] = useState<string | null>(null);

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await uploadImage.mutateAsync({ id: category._id, file });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: category._id,
        input: { name: name.trim(), sortOrder: Number(sortOrder) || 0 },
      });
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Update failed'));
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadImage.isPending}
          className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/50 text-muted-foreground hover:border-brand"
        >
          {category.image ? (
            <Image src={category.image.url} alt={category.name} fill className="object-cover" sizes="64px" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          {uploadImage.isPending && (
            <span className="absolute inset-0 grid place-items-center bg-black/40">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </span>
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onImage} />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-wrap gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-40" />
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-9 w-20"
                placeholder="Sort"
              />
              <Button size="sm" variant="brand" disabled={update.isPending} onClick={save}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="font-medium">{category.name}</p>
                <Badge variant={category.isActive ? 'success' : 'muted'}>
                  {category.isActive ? 'Active' : 'Hidden'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                /{category.slug} · sort {category.sortOrder}
              </p>
            </>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: category._id, input: { isActive: !category.isActive } })}
            >
              {category.isActive ? 'Hide' : 'Show'}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm(`Delete category "${category.name}"?`)) remove.mutate(category._id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
