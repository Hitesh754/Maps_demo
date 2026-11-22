#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

const configPath = process.env.REGION_CONFIG_PATH 
  ? path.resolve(process.cwd(), process.env.REGION_CONFIG_PATH)
  : path.join(rootDir, "config", "region.json");

console.log(`[Region Validation] Checking config: ${configPath}`);

if (!fs.existsSync(configPath)) {
  console.error(`[FAIL] Region config file not found: ${configPath}`);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error(`[FAIL] Region config is not valid JSON:`, err.message);
  process.exit(1);
}

const BoundingBoxSchema = z
  .tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ])
  .refine(([w, s, e, n]) => w < e, { message: "west < east required" })
  .refine(([w, s, e, n]) => s < n, { message: "south < north required" });

const RegionConfigSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    countryCode: z.string().length(2),
    bbox: BoundingBoxSchema,
    center: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    defaultZoom: z.number().min(0).max(24),
    minZoom: z.number().min(0).max(24),
    maxZoom: z.number().min(0).max(24),
    maxBoundsPadding: z.number().default(0.05),
    showAdminBoundaries: z.boolean().default(false),
    dataSource: z.string().min(1),
  })
  .refine(
    (cfg) => {
      const [w, s, e, n] = cfg.bbox;
      const [lng, lat] = cfg.center;
      return lng >= w && lng <= e && lat >= s && lat <= n;
    },
    { message: "Center must lie within bbox" }
  );

try {
  const validated = RegionConfigSchema.parse(raw);
  const [w, s, e, n] = validated.bbox;
  const widthDeg = (e - w).toFixed(4);
  const heightDeg = (n - s).toFixed(4);

  console.log(`[PASS] Region "${validated.name}" (${validated.slug}) is valid.`);
  console.log(`       Country: ${validated.countryCode}`);
  console.log(`       BBOX   : [${w}, ${s}, ${e}, ${n}] (${widthDeg}° x ${heightDeg}°)`);
  console.log(`       Center : [${validated.center[0]}, ${validated.center[1]}] (Zoom: ${validated.defaultZoom})`);
  console.log(`       Admin  : showAdminBoundaries=${validated.showAdminBoundaries}`);
  process.exit(0);
} catch (err) {
  console.error(`[FAIL] Region validation failed:`, err);
  process.exit(1);
}
