#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { VectorTile } = require("@mapbox/vector-tile");
const { PbfReader } = require("pbf");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

const configPath = path.join(rootDir, "config", "region.json");
const region = JSON.parse(fs.readFileSync(configPath, "utf8"));
const [lng, lat] = region.center;

const TILES_URL = process.env.TILES_BASE_URL || "http://127.0.0.1:8082";
const ASSETS_URL = process.env.MAP_ASSETS_BASE_URL || "http://127.0.0.1:8083";

console.log("==========================================================");
console.log(`Verifying Basemap Vector Tiles for Region: ${region.name}`);
console.log(`Tile Server: ${TILES_URL} | Assets Server: ${ASSETS_URL}`);
console.log("==========================================================");

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(latitude, zoom) {
  const rad = (latitude * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, buffer };
}

async function run() {
  // 1. Inspect archive header via Docker go-pmtiles
  console.log("\n1. Verifying PMTiles archive header via go-pmtiles...");
  const dataDirMount = path.join(rootDir, "data").replace(/\\/g, "/");
  const pmtilesPath = `/data/tiles/${region.slug}.pmtiles`;
  const showOutput = execSync(
    `docker run --rm -v "${dataDirMount}:/data" protomaps/go-pmtiles:latest show ${pmtilesPath}`,
    { encoding: "utf8" }
  );

  console.log(showOutput.trim().split("\n").slice(0, 12).join("\n"));

  if (!showOutput.includes("tile type: mvt") || !showOutput.includes("spec version: 3")) {
    throw new Error("Invalid PMTiles archive header format");
  }

  // 2. Query TileJSON
  console.log(`\n2. Verifying TileJSON endpoint at ${TILES_URL}/${region.slug}.json...`);
  const tilejsonRes = await fetch(`${TILES_URL}/${region.slug}.json`);
  if (tilejsonRes.status !== 200) {
    throw new Error(`TileJSON returned HTTP ${tilejsonRes.status}`);
  }

  const cors = tilejsonRes.headers.get("access-control-allow-origin");
  const contentType = tilejsonRes.headers.get("content-type");
  console.log(`   HTTP 200 OK | Content-Type: ${contentType} | CORS: ${cors || "*"}`);

  const tilejson = await tilejsonRes.json();
  const layers = tilejson.vector_layers || [];
  console.log(`   Discovered ${layers.length} vector layers in TileJSON.`);

  // Write tile layer inventory
  const docsDir = path.join(rootDir, "docs", "data");
  fs.mkdirSync(docsDir, { recursive: true });
  const inventoryDoc = [
    `# Tile Layer Inventory: ${region.name} (${region.slug})`,
    "",
    `**Data Source:** OpenMapTiles (v${tilejson.version}) derived from OpenStreetMap`,
    `**Tile Archive:** \`data/tiles/${region.slug}.pmtiles\``,
    `**Zoom Range:** ${tilejson.minzoom} – ${tilejson.maxzoom}`,
    `**Bounds:** [${tilejson.bounds.join(", ")}]`,
    "",
    "## Vector Layers & Schema",
    "",
    "| Layer ID | Min Zoom | Max Zoom | Key Attributes / Fields |",
    "| :--- | :---: | :---: | :--- |",
    ...layers.map(
      (l) =>
        `| \`${l.id}\` | ${l.minzoom} | ${l.maxzoom} | ${Object.keys(l.fields || {}).slice(0, 6).join(", ")}${Object.keys(l.fields || {}).length > 6 ? ", ..." : ""} |`
    ),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(docsDir, "tile-layer-inventory.md"), inventoryDoc);
  console.log(`   Written layer inventory to docs/data/tile-layer-inventory.md`);

  // 3. Verify real tiles at region center for z0, z6, z10, z14
  console.log("\n3. Fetching and decoding vector tiles at region center...");
  const testZooms = [0, 6, 10, 14];
  const decodedSummary = [];

  for (const z of testZooms) {
    const x = lon2tile(lng, z);
    const y = lat2tile(lat, z);
    const tileUrl = `${TILES_URL}/${region.slug}/${z}/${x}/${y}.mvt`;

    const { status, headers, buffer } = await fetchBuffer(tileUrl);
    if (status !== 200) {
      throw new Error(`Tile ${z}/${x}/${y} returned HTTP ${status}`);
    }

    // Uncompress if gzipped
    let pbfBuffer = buffer;
    if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
      pbfBuffer = zlib.gunzipSync(buffer);
    }

    const pbf = new PbfReader(pbfBuffer);
    const vt = new VectorTile(pbf);
    const layerNames = Object.keys(vt.layers);

    let totalFeatures = 0;
    const layerCounts = {};
    for (const name of layerNames) {
      const count = vt.layers[name].length;
      layerCounts[name] = count;
      totalFeatures += count;
    }

    decodedSummary.push({
      zoom: z,
      tile: `${z}/${x}/${y}`,
      sizeBytes: buffer.length,
      layerCount: layerNames.length,
      totalFeatures,
      layers: layerCounts,
    });

    console.log(`   [Zoom ${z}] Tile ${z}/${x}/${y} (${buffer.length} bytes):`);
    console.log(`      Layers (${layerNames.length}): ${layerNames.join(", ")}`);
    console.log(`      Total Features: ${totalFeatures}`);
  }

  // Assert expected layers
  const z14 = decodedSummary.find((s) => s.zoom === 14);
  const expectedLayers = ["transportation", "building", "place", "water"];
  for (const req of expectedLayers) {
    if (!z14.layers[req] || z14.layers[req] === 0) {
      throw new Error(`Expected layer '${req}' missing or empty at zoom 14! Found: ${JSON.stringify(z14.layers)}`);
    }
  }
  console.log(`   [PASS] All expected core layers (transportation, building, place, water) present at z14.`);

  // 4. Assert out-of-region tile behavior
  console.log("\n4. Verifying out-of-region tile request...");
  const outOfRegionUrl = `${TILES_URL}/${region.slug}/14/0/0.mvt`;
  const outRes = await fetch(outOfRegionUrl);
  console.log(`   Out-of-region (14/0/0.mvt) returned HTTP ${outRes.status} (expected 204 or 404)`);
  if (outRes.status !== 204 && outRes.status !== 404) {
    throw new Error(`Expected 204 or 404 for out-of-region tile, got ${outRes.status}`);
  }
  console.log("   [PASS] Out-of-region tile properly rejected.");

  // 5. Verify static map assets server (glyphs)
  console.log("\n5. Verifying static map assets server on port 8083...");
  const glyphUrl = `${ASSETS_URL}/glyphs/Noto%20Sans%20Regular/0-255.pbf`;
  const glyphRes = await fetch(glyphUrl);
  if (glyphRes.status !== 200) {
    throw new Error(`Glyph asset request returned HTTP ${glyphRes.status}`);
  }
  const glyphCache = glyphRes.headers.get("cache-control");
  const glyphCors = glyphRes.headers.get("access-control-allow-origin");
  console.log(`   HTTP 200 OK | Content-Length: ${glyphRes.headers.get("content-length")} bytes`);
  console.log(`   Cache-Control: ${glyphCache} | CORS: ${glyphCors || "*"}`);
  console.log("   [PASS] Static assets server operational.");

  console.log("\n==========================================================");
  console.log("ALL TILE & ASSET VERIFICATION CHECKS PASSED!");
  console.log("==========================================================");
}

run().catch((err) => {
  console.error("\n[FAIL] Tile verification failed:", err);
  process.exit(1);
});
