'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, LocateFixed } from 'lucide-react';
import type { Address } from 'shared-types';
import { createAddress } from '@/features/address/api';
import { reverseGeocode, searchPlaces, extractAddressParts } from '@/lib/geocode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/auth/auth-shell';
import { getApiErrorMessage } from '@/lib/api';

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-muted" />,
});

const schema = z.object({
  label: z.string().min(1, 'Required'),
  fullName: z.string().min(2, 'Enter the recipient name'),
  phone: z.string().min(7, 'Enter a valid phone'),
  addressLine: z.string().min(3, 'Enter the street / area'),
  city: z.string().min(2, 'Enter the city'),
  district: z.string().min(2, 'Enter the district'),
});
type Values = z.infer<typeof schema>;

export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (a: Address) => void;
  onCancel?: () => void;
}) {
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [searchQ, setSearchQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { label: 'Home' } });

  const applyGeo = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    const parts = extractAddressParts(await reverseGeocode(lat, lng));
    if (parts.city) setValue('city', parts.city);
    if (parts.district) setValue('district', parts.district);
    if (parts.addressLine) setValue('addressLine', parts.addressLine);
  };

  const runSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    const res = await searchPlaces(searchQ);
    setSearching(false);
    if (res[0]) applyGeo(Number(res[0].lat), Number(res[0].lon));
    else setError('No matching place found');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      applyGeo(pos.coords.latitude, pos.coords.longitude),
    );
  };

  const submit = async (v: Values) => {
    setError(null);
    if (coords.lat === undefined || coords.lng === undefined) {
      setError('Please pick your delivery location on the map');
      return;
    }
    setSaving(true);
    try {
      const address = await createAddress({ ...v, latitude: coords.lat, longitude: coords.lng });
      onSaved(address);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not save address'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="Search a place (e.g. Thamel, Kathmandu)"
            className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="button" variant="outline" onClick={runSearch} disabled={searching}>
          {searching ? '…' : 'Search'}
        </Button>
        <Button type="button" variant="outline" onClick={useMyLocation} className="gap-1.5">
          <LocateFixed className="h-4 w-4" />
          Locate me
        </Button>
      </div>

      <LocationMap lat={coords.lat} lng={coords.lng} onChange={applyGeo} />
      <p className="text-xs text-muted-foreground">
        Tap the map to drop a pin (or drag it). We use this location for delivery and shipping.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register('fullName')} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="addressLine">Street / Area</Label>
        <Input id="addressLine" {...register('addressLine')} />
        <FieldError message={errors.addressLine?.message} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Input id="district" {...register('district')} />
          <FieldError message={errors.district?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" placeholder="Home / Office" {...register('label')} />
      </div>

      {error && <p className="text-sm text-brand">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="brand" disabled={saving}>
          {saving ? 'Saving…' : 'Save address'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
