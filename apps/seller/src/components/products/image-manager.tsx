'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, X } from 'lucide-react';
import type { ApiImage, ApiProduct } from '@/features/products/api';
import { addProductImages, removeProductImage } from '@/features/products/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api';

export function ImageManager({ productId, images }: { productId: string; images: ApiImage[] }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = (product: ApiProduct) => qc.setQueryData(['my-product', productId], product);

  const add = useMutation({
    mutationFn: (files: File[]) => addProductImages(productId, files),
    onSuccess: sync,
    onError: (err) => setError(getApiErrorMessage(err, 'Upload failed')),
  });

  const remove = useMutation({
    mutationFn: (publicId: string) => removeProductImage(productId, publicId),
    onSuccess: sync,
    onError: (err) => setError(getApiErrorMessage(err, 'Could not remove image')),
  });

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setError(null);
      add.mutate(files);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.publicId} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border">
              <Image src={img.url} alt="product" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => remove.mutate(img.publicId)}
                disabled={remove.isPending}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={add.isPending}
            className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-border text-muted-foreground hover:border-brand"
          >
            {add.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="h-5 w-5" />
                Add
              </span>
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Up to 8 images. The first image is used as the product thumbnail.
        </p>
      </CardContent>
    </Card>
  );
}
