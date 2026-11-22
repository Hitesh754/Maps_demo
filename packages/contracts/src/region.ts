import { z } from "zod";

/**
 * Bounding box in WGS 84 [west, south, east, north] (EPSG:4326).
 */
export const BoundingBoxSchema = z
  .tuple([
    z.number().min(-180).max(180), // west (min lng)
    z.number().min(-90).max(90),   // south (min lat)
    z.number().min(-180).max(180), // east (max lng)
    z.number().min(-90).max(90),   // north (max lat)
  ])
  .refine(([west, , east]) => west < east, {
    message: "Bounding box west longitude must be strictly less than east longitude",
  })
  .refine(([, south, , north]) => south < north, {
    message: "Bounding box south latitude must be strictly less than north latitude",
  });

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

/**
 * Coordinate pair [lng, lat] (EPSG:4326).
 */
export const CoordinateSchema = z.tuple([
  z.number().min(-180).max(180), // lng
  z.number().min(-90).max(90),   // lat
]);

export type Coordinate = z.infer<typeof CoordinateSchema>;

/**
 * Schema defining a single configured geographic region in Meridian.
 */
export const RegionConfigSchema = z
  .object({
    name: z.string().min(1, "Region name cannot be empty"),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Region slug must consist only of lowercase letters, digits, and hyphens"),
    countryCode: z.string().length(2, "Country code must be ISO 3166-1 alpha-2 (2 characters)"),
    bbox: BoundingBoxSchema,
    center: CoordinateSchema,
    defaultZoom: z.number().min(0).max(24),
    minZoom: z.number().min(0).max(24),
    maxZoom: z.number().min(0).max(24),
    maxBoundsPadding: z.number().min(0).max(5).default(0.05),
    showAdminBoundaries: z.boolean().default(false),
    dataSource: z.string().min(1),
  })
  .refine(
    (cfg) => {
      const [west, south, east, north] = cfg.bbox;
      const [lng, lat] = cfg.center;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    },
    {
      message: "Region center [lng, lat] must lie within the region bounding box [west, south, east, north]",
      path: ["center"],
    }
  )
  .refine((cfg) => cfg.minZoom <= cfg.defaultZoom && cfg.defaultZoom <= cfg.maxZoom, {
    message: "Zoom levels must satisfy: minZoom <= defaultZoom <= maxZoom",
    path: ["defaultZoom"],
  });

export type RegionConfig = z.infer<typeof RegionConfigSchema>;
