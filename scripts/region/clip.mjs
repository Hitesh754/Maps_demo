#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

const configPath = path.join(rootDir, "config", "region.json");
const region = JSON.parse(fs.readFileSync(configPath, "utf8"));
const [west, south, east, north] = region.bbox;

const bufferDeg = parseFloat(process.env.BUFFER_DEG || "0.05"); // ~5 km context buffer
const bufferedBbox = [
  parseFloat((west - bufferDeg).toFixed(4)),
  parseFloat((south - bufferDeg).toFixed(4)),
  parseFloat((east + bufferDeg).toFixed(4)),
  parseFloat((north + bufferDeg).toFixed(4)),
];

console.log(`[Clip] Region: ${region.name} (${region.slug})`);
console.log(`[Clip] Base BBOX    : [${west}, ${south}, ${east}, ${north}]`);
console.log(`[Clip] Buffered BBOX: [${bufferedBbox.join(", ")}] (buffer: ${bufferDeg}°)`);

const rawPbf = path.join(rootDir, "data", "raw", "western-zone-latest.osm.pbf");
if (!fs.existsSync(rawPbf)) {
  console.error(`[FAIL] Raw PBF not found at ${rawPbf}. Run acquire step first.`);
  process.exit(1);
}

const clippedPbfName = `${region.slug}.osm.pbf`;
const clippedPbf = path.join(rootDir, "data", "region", clippedPbfName);

console.log(`[Clip] Input : ${rawPbf}`);
console.log(`[Clip] Output: ${clippedPbf}`);

// Convert local paths for Docker volume mounting
const dataDirMount = path.join(rootDir, "data").replace(/\\/g, "/");
const bboxArg = `${bufferedBbox[0]},${bufferedBbox[1]},${bufferedBbox[2]},${bufferedBbox[3]}`;

console.log(`[Clip] Executing osmium extract in Docker...`);
const extractCmd = `docker run --rm -v "${dataDirMount}:/data" stefda/osmium-tool:latest osmium extract --bbox ${bboxArg} -o /data/region/${clippedPbfName} /data/raw/western-zone-latest.osm.pbf --overwrite`;

const start = Date.now();
try {
  execSync(extractCmd, { stdio: "inherit" });
} catch (err) {
  console.error(`[FAIL] Osmium extract failed:`, err);
  process.exit(1);
}
const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
console.log(`[PASS] Osmium extract completed in ${elapsedSec}s.`);

// Inspect clipped output using osmium fileinfo
console.log(`[Clip] Inspecting clipped extract metadata...`);
let fileinfoOut = "";
try {
  fileinfoOut = execSync(
    `docker run --rm -v "${dataDirMount}:/data" stefda/osmium-tool:latest osmium fileinfo -e /data/region/${clippedPbfName}`,
    { encoding: "utf8" }
  );
} catch (err) {
  console.warn(`[WARN] Could not inspect fileinfo with -e:`, err.message);
  fileinfoOut = execSync(
    `docker run --rm -v "${dataDirMount}:/data" stefda/osmium-tool:latest osmium fileinfo /data/region/${clippedPbfName}`,
    { encoding: "utf8" }
  );
}

console.log(fileinfoOut);

const stat = fs.statSync(clippedPbf);
console.log(`[Clip] Clipped file size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);

// Update manifest
const manifestPath = path.join(rootDir, "data", "region", "manifest.json");
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

manifest.clip = {
  clippedPbfPath: `data/region/${clippedPbfName}`,
  fileSizeBytes: stat.size,
  bufferedBbox: bufferedBbox,
  bufferDegrees: bufferDeg,
  clipDurationSeconds: parseFloat(elapsedSec),
  clipTimestamp: new Date().toISOString(),
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`[Clip] Updated manifest at ${manifestPath}`);
