'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ApiVariant } from '@/features/catalog/api';
import { cn } from '@/lib/utils';

interface Attribute {
  name: string;
  values: string[];
}

/** Resolve the single variant matching a full set of option selections. */
function resolve(
  variants: ApiVariant[],
  axes: string[],
  selected: Record<string, string>,
): ApiVariant | null {
  if (axes.some((a) => !selected[a])) return null; // not every option chosen yet
  return variants.find((v) => axes.every((a) => v.attributes?.[a] === selected[a])) ?? null;
}

/**
 * Daraz/Amazon-style option selector: one row per attribute (Color, Size, RAM…).
 * Picking one value per axis resolves to a specific variant; values with no
 * in-stock variant (given the other picks) are disabled.
 */
export function VariantPicker({
  attributes,
  variants,
  onChange,
}: {
  attributes: Attribute[];
  variants: ApiVariant[];
  onChange: (variant: ApiVariant | null, complete: boolean) => void;
}) {
  const axes = useMemo(() => attributes.map((a) => a.name), [attributes]);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const resolved = useMemo(() => resolve(variants, axes, selected), [variants, axes, selected]);
  const complete = axes.every((a) => selected[a]);

  useEffect(() => {
    onChange(resolved, complete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, complete]);

  // A value is available if some in-stock variant carries it while staying
  // consistent with the picks made on the *other* axes.
  const available = (axis: string, value: string) =>
    variants.some(
      (v) =>
        v.stock > 0 &&
        v.attributes?.[axis] === value &&
        axes.filter((a) => a !== axis).every((a) => !selected[a] || v.attributes?.[a] === selected[a]),
    );

  const pick = (axis: string, value: string) =>
    setSelected((cur) => {
      if (cur[axis] === value) {
        const next = { ...cur };
        delete next[axis];
        return next;
      }
      return { ...cur, [axis]: value };
    });

  return (
    <div className="mt-5 space-y-4">
      {attributes.map((attr) => (
        <div key={attr.name}>
          <p className="mb-2 text-sm font-medium">
            {attr.name}
            {selected[attr.name] && (
              <span className="font-normal text-muted-foreground"> · {selected[attr.name]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((val) => {
              const active = selected[attr.name] === val;
              const enabled = active || available(attr.name, val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => pick(attr.name, val)}
                  disabled={!enabled}
                  className={cn(
                    'min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-border hover:border-brand/50 hover:bg-muted',
                    !enabled && 'cursor-not-allowed text-muted-foreground/50 line-through opacity-60',
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
