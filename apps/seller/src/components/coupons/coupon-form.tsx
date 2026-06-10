'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { DiscountType } from 'shared-types';
import { useCouponMutations } from '@/features/coupons/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api';

export function CouponForm({ oncreated }: { oncreated?: () => void }) {
  const { create } = useCouponMutations();
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscount('');
    setUsageLimit('');
    setExpiresAt('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = Number(discountValue);
    if (code.trim().length < 3) return setError('Code must be at least 3 characters.');
    if (!(value > 0)) return setError('Discount value must be greater than 0.');
    if (discountType === 'PERCENTAGE' && value > 100)
      return setError('A percentage discount cannot exceed 100.');

    try {
      await create.mutateAsync({
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: value,
        minOrderAmount: minOrderAmount !== '' ? Number(minOrderAmount) : undefined,
        maxDiscount: maxDiscount !== '' ? Number(maxDiscount) : undefined,
        usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      reset();
      oncreated?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create coupon'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create coupon</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ccode">Code</Label>
              <Input
                id="ccode"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DASHAIN10"
              />
            </div>
            <div>
              <Label htmlFor="ctype">Type</Label>
              <Select
                id="ctype"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat (Rs.)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvalue">
                {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount amount (Rs.)'}
              </Label>
              <Input
                id="cvalue"
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            {discountType === 'PERCENTAGE' && (
              <div>
                <Label htmlFor="cmax">Max discount cap (Rs., optional)</Label>
                <Input
                  id="cmax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="cmin">Min order amount (Rs., optional)</Label>
              <Input
                id="cmin"
                type="number"
                min="0"
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="climit">Usage limit (optional)</Label>
              <Input
                id="climit"
                type="number"
                min="1"
                step="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cexp">Expires at (optional)</Label>
              <Input
                id="cexp"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cdesc">Description (optional)</Label>
              <Textarea
                id="cdesc"
                className="min-h-[72px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Festival discount on all items"
              />
            </div>
          </div>
          <Button type="submit" variant="brand" disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create coupon
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
