export interface RegionConfig {
  name: string;
  slug: string;
  countryCode: string;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  center: [number, number]; // [lng, lat]
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  maxBoundsPadding: number;
  showAdminBoundaries: boolean;
  dataSource: string;
}

export const VADODARA_REGION: RegionConfig = {
  name: "Vadodara, Gujarat, India",
  slug: "vadodara",
  countryCode: "IN",
  bbox: [73.11, 22.24, 73.28, 22.37],
  center: [73.1812, 22.3072],
  defaultZoom: 12,
  minZoom: 0,
  maxZoom: 15,
  maxBoundsPadding: 0.05,
  showAdminBoundaries: false,
  dataSource: "OpenStreetMap contributors (ODbL)"
};

/**
 * Checks if a coordinate [lng, lat] is within the region bounding box + padding.
 */
export function isCoordinateInRegion(
  coord: [number, number],
  region: RegionConfig = VADODARA_REGION,
  paddingMargin: number = 0
): boolean {
  const [lng, lat] = coord;
  const [minLng, minLat, maxLng, maxLat] = region.bbox;
  return (
    lng >= minLng - paddingMargin &&
    lng <= maxLng + paddingMargin &&
    lat >= minLat - paddingMargin &&
    lat <= maxLat + paddingMargin
  );
}

/**
 * Returns camera bounds padded by maxBoundsPadding
 */
export function getRegionBounds(region: RegionConfig = VADODARA_REGION): [number, number, number, number] {
  const [minLng, minLat, maxLng, maxLat] = region.bbox;
  const pad = region.maxBoundsPadding;
  return [minLng - pad, minLat - pad, maxLng + pad, maxLat + pad];
}
