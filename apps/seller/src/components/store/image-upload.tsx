'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useUploadStoreImage } from '@/features/store/hooks';
import { getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

export function StoreImageUpload({
  kind,
  current,
}: {
  kind: 'logo' | 'cover';
  current: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadStoreImage();
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await upload.mutateAsync({ kind, file });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isLogo = kind === 'logo';

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        className={cn(
          'relative grid place-items-center overflow-hidden border border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:border-brand',
          isLogo ? 'h-28 w-28 rounded-2xl' : 'h-28 w-full rounded-2xl',
        )}
      >
        {current ? (
          <Image
            src={current}
            alt={kind}
            fill
            className="object-cover"
            sizes={isLogo ? '112px' : '100vw'}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="h-5 w-5" />
            Add {kind}
          </span>
        )}
        {upload.isPending && (
          <span className="absolute inset-0 grid place-items-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
