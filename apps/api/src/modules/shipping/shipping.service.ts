import { prisma } from '@/config/db.postgres';
import { haversineKm } from '@/shared/utils/distance';
import type { ShippingQuote } from 'shared-types';

const round2 = (n: number): number => Math.round(n * 100) / 100;

interface ZoneOption {
  name: string;
  distanceKm: number;
  shippingFee: number;
}

/**
 * Picks the tightest active delivery zone whose radius covers `distanceKm`.
 * Returns null when nothing covers it (out of range). Shared by shipping quotes
 * and checkout.
 */
export const selectDeliveryFee = (
  distanceKm: number,
  zones: ZoneOption[],
): { shippingFee: number; zoneName: string } | null => {
  const zone = zones
    .filter((z) => distanceKm <= z.distanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  return zone ? { shippingFee: zone.shippingFee, zoneName: zone.name } : null;
};

/**
 * Computes a per-store shipping quote for a delivery point.
 * For each ACTIVE store: distance (Haversine) → the tightest active delivery
 * zone whose radius covers that distance → its fee. Stores that are missing a
 * location or out of range are returned as not deliverable.
 */
export const getShippingQuotes = async (params: {
  latitude: number;
  longitude: number;
  storeIds: string[];
}): Promise<ShippingQuote[]> => {
  const { latitude, longitude, storeIds } = params;

  // De-duplicate requested ids.
  const ids = [...new Set(storeIds)];

  const stores = await prisma.store.findMany({
    where: { id: { in: ids }, status: 'ACTIVE' },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      deliveryZones: {
        where: { isActive: true },
        select: { name: true, distanceKm: true, shippingFee: true },
      },
    },
  });

  const byId = new Map(stores.map((s) => [s.id, s]));

  return ids.map((storeId): ShippingQuote => {
    const store = byId.get(storeId);
    if (!store) {
      return { storeId, deliverable: false, distanceKm: null, shippingFee: null, reason: 'Store unavailable' };
    }
    if (store.latitude == null || store.longitude == null) {
      return { storeId, deliverable: false, distanceKm: null, shippingFee: null, reason: 'Store location not set' };
    }

    const distanceKm = haversineKm(
      { lat: latitude, lng: longitude },
      { lat: store.latitude, lng: store.longitude },
    );

    const fee = selectDeliveryFee(distanceKm, store.deliveryZones);
    if (!fee) {
      return {
        storeId,
        deliverable: false,
        distanceKm: round2(distanceKm),
        shippingFee: null,
        reason: 'Outside delivery range',
      };
    }

    return {
      storeId,
      deliverable: true,
      distanceKm: round2(distanceKm),
      shippingFee: fee.shippingFee,
      zoneName: fee.zoneName,
    };
  });
};
