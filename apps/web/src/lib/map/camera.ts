export interface CameraState {
  zoom: number;
  lng: number;
  lat: number;
  bearing?: number;
  pitch?: number;
}

/**
 * Parses URL hash of format: #map={zoom}/{lat}/{lng}/{bearing}/{pitch}
 */
export function parseCameraHash(hash: string): CameraState | null {
  if (!hash) return null;
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean.startsWith("map=")) return null;

  const parts = clean.slice(4).split("/");
  if (parts.length < 3) return null;

  const zoom = parseFloat(parts[0] || "");
  const lat = parseFloat(parts[1] || "");
  const lng = parseFloat(parts[2] || "");
  const bearing = parts[3] ? parseFloat(parts[3]) : 0;
  const pitch = parts[4] ? parseFloat(parts[4]) : 0;

  if (
    isNaN(zoom) ||
    isNaN(lat) ||
    isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    zoom < 0 ||
    zoom > 24
  ) {
    return null;
  }

  return { zoom, lat, lng, bearing, pitch };
}

/**
 * Formats CameraState into hash string #map=z/lat/lng/bearing/pitch
 */
export function formatCameraHash(camera: CameraState): string {
  const z = Math.round(camera.zoom * 100) / 100;
  const lat = Math.round(camera.lat * 10000) / 10000;
  const lng = Math.round(camera.lng * 10000) / 10000;
  const bearing = Math.round((camera.bearing || 0) * 10) / 10;
  const pitch = Math.round((camera.pitch || 0) * 10) / 10;

  return `#map=${z}/${lat}/${lng}/${bearing}/${pitch}`;
}
