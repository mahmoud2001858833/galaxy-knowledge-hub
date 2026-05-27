// Geolocation helpers: distance, bearing, heading text (Arabic), and OSM Nominatim geocoding.

export type LatLng = { lat: number; lng: number };

const R = 6371e3; // earth radius in meters
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function bearing(from: LatLng, to: LatLng): number {
  const φ1 = toRad(from.lat), φ2 = toRad(to.lat);
  const λ1 = toRad(from.lng), λ2 = toRad(to.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const CARDINAL_AR = ['شمالاً', 'شمال شرق', 'شرقاً', 'جنوب شرق', 'جنوباً', 'جنوب غرب', 'غرباً', 'شمال غرب'];
export function cardinalAr(deg: number): string {
  return CARDINAL_AR[Math.round(((deg % 360) / 45)) % 8];
}

export function relativeDirectionAr(targetBearing: number, userHeading: number | null): string {
  if (userHeading == null) return `اتجه ${cardinalAr(targetBearing)}`;
  let diff = ((targetBearing - userHeading + 540) % 360) - 180; // -180..180
  if (Math.abs(diff) < 15) return 'استمر للأمام';
  if (Math.abs(diff) < 45) return diff > 0 ? 'انحرف قليلاً يميناً' : 'انحرف قليلاً يساراً';
  if (Math.abs(diff) < 110) return diff > 0 ? 'انعطف يميناً' : 'انعطف يساراً';
  return 'استدر للخلف';
}

export function formatDistanceAr(meters: number): string {
  if (meters < 20) return 'وصلت تقريباً';
  if (meters < 1000) return `${Math.round(meters)} متراً`;
  return `${(meters / 1000).toFixed(1)} كيلومتر`;
}

export async function geocodePlace(query: string): Promise<LatLng | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const r = await fetch(url, { headers: { 'Accept-Language': 'ar' } });
    if (!r.ok) return null;
    const arr = await r.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
  } catch {
    return null;
  }
}
