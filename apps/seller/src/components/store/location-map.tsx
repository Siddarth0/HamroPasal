'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Use CDN marker images so we don't fight the bundler over Leaflet's default icon.
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const KATHMANDU: [number, number] = [27.7172, 85.324];

function Picker({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  if (lat === undefined || lng === undefined) return null;
  return (
    <Marker
      position={[lat, lng]}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const m = (e.target as L.Marker).getLatLng();
          onChange(m.lat, m.lng);
        },
      }}
    />
  );
}

function Recenter({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) map.flyTo([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({
  lat,
  lng,
  onChange,
}: {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={lat !== undefined && lng !== undefined ? [lat, lng] : KATHMANDU}
      zoom={13}
      scrollWheelZoom
      className="h-72 w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Picker lat={lat} lng={lng} onChange={onChange} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
