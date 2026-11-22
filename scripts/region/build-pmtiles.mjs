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

const manifestPath = path.join(rootDir, "data", "region", "manifest.json");
let manifest = {};
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

const clippedPbfName = `${region.slug}.osm.pbf`;
const clippedPbf = path.join(rootDir, "data", "region", clippedPbfName);
if (!fs.existsSync(clippedPbf)) {
  console.error(`[FAIL] Clipped PBF not found at ${clippedPbf}. Run clip step first.`);
  process.exit(1);
}

const tilesDir = path.join(rootDir, "data", "tiles");
const tmpDir = path.join(rootDir, "data", "tmp");
fs.mkdirSync(tilesDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const pmtilesName = `${region.slug}.pmtiles`;
const pmtilesPath = path.join(tilesDir, pmtilesName);

// Use buffered bbox from manifest if available, otherwise default to region bbox
const bounds = (manifest.clip && manifest.clip.bufferedBbox) || region.bbox;
const boundsArg = `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`;

console.log(`[Planetiler] Target Region: ${region.name} (${region.slug})`);
console.log(`[Planetiler] Input PBF    : ${clippedPbf}`);
console.log(`[Planetiler] Output Tiles : ${pmtilesPath}`);
console.log(`[Planetiler] Bounds       : ${boundsArg}`);

const dataDirMount = path.join(rootDir, "data").replace(/\\/g, "/");

// Construct Planetiler docker command
// Memory limit set to 3 GB heap (-Xmx3g) for strict 8 GB host RAM safety budget
const planetilerCmd = [
  "docker run --rm",
  '-e JAVA_TOOL_OPTIONS="-Xmx3g"',
  `-v "${dataDirMount}:/data"`,
  "ghcr.io/onthegomap/planetiler:latest",
  `--osm-path="/data/region/${clippedPbfName}"`,
  `--bounds="${boundsArg}"`,
  `--output="/data/tiles/${pmtilesName}"`,
  "--download",
  "--nodemap-type=sparsearray",
  "--nodemap-storage=mmap",
  "--tmpdir=/data/tmp",
  "--maxzoom=14",
  "--render-maxzoom=14",
  "--force=true",
  "--fetch-wikidata=false",
].join(" ");

console.log(`[Planetiler] Running command:\n${planetilerCmd}\n`);
const startTime = Date.now();

try {
  execSync(planetilerCmd, { stdio: "inherit" });
} catch (err) {
  console.error(`[FAIL] Planetiler build failed:`, err);
  process.exit(1);
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[PASS] Planetiler finished in ${elapsedSec}s.`);

if (!fs.existsSync(pmtilesPath)) {
  console.error(`[FAIL] Expected output file not found: ${pmtilesPath}`);
  process.exit(1);
}

const stat = fs.statSync(pmtilesPath);
const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
console.log(`[Planetiler] Generated PMTiles archive size: ${sizeMb} MB (${stat.size} bytes)`);

// Record in manifest
manifest.pmtiles = {
  outputPath: `data/tiles/${pmtilesName}`,
  fileSizeBytes: stat.size,
  fileSizeMb: parseFloat(sizeMb),
  bounds: bounds,
  maxzoom: 14,
  buildDurationSeconds: parseFloat(elapsedSec),
  heapLimit: "3g",
  completedAt: new Date().toISOString(),
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`[Planetiler] Recorded build metrics to ${manifestPath}`);
