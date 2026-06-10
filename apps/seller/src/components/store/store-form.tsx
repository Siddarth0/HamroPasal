'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import type { Store } from 'shared-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApplyForStore, useUpdateStore } from '@/features/store/hooks';
import { reverseGeocode, searchPlaces, extractAddressParts } from '@/lib/geocode';
import { getApiErrorMessage } from '@/lib/api';

const LocationMap = dynamic(() => import('./location-map'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-muted" />,
});

interface FieldState {
  name: string;
  description: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export function StoreForm({ store }: { store?: Store }) {
  const router = useRouter();
  const isEdit = !!store;
  const apply = useApplyForStore();
  const update = useUpdateStore();

  const [fields, setFields] = useState<FieldState>({
    name: store?.name ?? '',
    description: store?.description ?? '',
    phone: store?.phone ?? '',
    email: store?.email ?? '',
    addressLine: store?.addressLine ?? '',
    city: store?.city ?? '',
    latitude: store?.latitude ?? undefined,
    longitude: store?.longitude ?? undefined,
  });
  const [placeQuery, setPlaceQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FieldState>(key: K, value: FieldState[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  const applyReverse = async (lat: number, lng: number) => {
    set('latitude', lat);
    set('longitude', lng);
    const parts = extractAddressParts(await reverseGeocode(lat, lng));
    setFields((f) => ({
      ...f,
      latitude: lat,
      longitude: lng,
      city: f.city || parts.city,
      addressLine: f.addressLine || parts.addressLine,
    }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      applyReverse(pos.coords.latitude, pos.coords.longitude),
    );
  };

  const runSearch = async () => {
    if (!placeQuery.trim()) return;
    setSearching(true);
    const results = await searchPlaces(placeQuery);
    setSearching(false);
    if (results[0]) await applyReverse(Number(results[0].lat), Number(results[0].lon));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    const payload = {
      name: fields.name,
      description: fields.description || undefined,
      phone: fields.phone || undefined,
      email: fields.email || undefined,
      addressLine: fields.addressLine || undefined,
      city: fields.city || undefined,
      latitude: fields.latitude,
      longitude: fields.longitude,
    };

    try {
      if (isEdit) {
        await update.mutateAsync(payload);
        setDone(true);
      } else {
        await apply.mutateAsync(payload);
        router.replace('/store');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your store'));
    }
  };

  const saving = apply.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {done && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Store details saved.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Store name</Label>
          <Input
            id="name"
            required
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Himalayan Handicrafts"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={fields.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Tell shoppers what your store sells."
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="98XXXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="email">Store email</Label>
          <Input
            id="email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="store@example.com"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={fields.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Kathmandu"
          />
        </div>
        <div>
          <Label htmlFor="addressLine">Address line</Label>
          <Input
            id="addressLine"
            value={fields.addressLine}
            onChange={(e) => set('addressLine', e.target.value)}
            placeholder="Street, area"
          />
        </div>
      </div>

      <div>
        <Label>Store location (used to calculate delivery)</Label>
        <div className="mb-2 flex flex-wrap gap-2">
          <div className="flex flex-1 gap-2">
            <Input
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              placeholder="Search a place…"
            />
            <Button type="button" variant="outline" onClick={runSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={useMyLocation}>
            <LocateFixed className="h-4 w-4" /> Use my location
          </Button>
        </div>
        <LocationMap lat={fields.latitude} lng={fields.longitude} onChange={applyReverse} />
        <p className="mt-2 text-xs text-muted-foreground">
          {fields.latitude !== undefined && fields.longitude !== undefined
            ? `Pinned at ${fields.latitude.toFixed(5)}, ${fields.longitude.toFixed(5)} — drag the marker to fine-tune.`
            : 'Click the map or search to drop a pin. A location is required for shipping quotes.'}
        </p>
      </div>

      <Button type="submit" variant="brand" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEdit ? 'Save changes' : 'Submit store for approval'}
      </Button>
    </form>
  );
}
