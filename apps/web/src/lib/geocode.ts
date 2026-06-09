// Lightweight OpenStreetMap Nominatim helpers (no API key; CORS-enabled).
// Usage policy: keep volume low (we only call on map clicks / search submit).

const BASE = 'https://nominatim.openstreetmap.org';

export interface ReverseResult {
  display_name: string;
  address?: Record<string, string>;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseResult | null> {
  try {
    const res = await fetch(`${BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as ReverseResult;
  } catch {
    return null;
  }
}

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `${BASE}/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return [];
    return (await res.json()) as SearchResult[];
  } catch {
    return [];
  }
}

/** Pull friendly city / district / street fields out of a reverse-geocode address. */
export function extractAddressParts(r: ReverseResult | null) {
  const a = r?.address ?? {};
  const city = a.city || a.town || a.village || a.municipality || a.county || '';
  const district = a.district || a.state_district || a.county || a.state || '';
  const street = [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ');
  return {
    city,
    district,
    addressLine: street || r?.display_name?.split(',').slice(0, 2).join(', ') || '',
  };
}
