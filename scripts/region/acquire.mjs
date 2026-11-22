#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");

const configPath = path.join(rootDir, "config", "region.json");
if (!fs.existsSync(configPath)) {
  console.error(`[FAIL] Region config not found at ${configPath}`);
  process.exit(1);
}

const region = JSON.parse(fs.readFileSync(configPath, "utf8"));
const [west, south, east, north] = region.bbox;

const rawDir = path.join(rootDir, "data", "raw");
const regionDir = path.join(rootDir, "data", "region");
fs.mkdirSync(rawDir, { recursive: true });
fs.mkdirSync(regionDir, { recursive: true });

console.log(`[Acquisition] Target Region: ${region.name} (${region.slug})`);
console.log(`[Acquisition] Bounding Box: [${west}, ${south}, ${east}, ${north}]`);

const USER_AGENT = "Meridian-Geospatial-Pipeline/1.0 (+https://github.com/RoadSenseAI)";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": USER_AGENT } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJSON(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(JSON.parse(body)));
    });
    req.on("error", reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": USER_AGENT } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve(body.trim()));
    });
    req.on("error", reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": USER_AGENT } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
      }

      const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
      const lastModified = res.headers["last-modified"] || new Date().toISOString();
      let downloadedBytes = 0;
      let lastReport = 0;

      const fileStream = fs.createWriteStream(destPath);
      res.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        const now = Date.now();
        if (now - lastReport > 2000 || downloadedBytes === totalBytes) {
          const mb = (downloadedBytes / (1024 * 1024)).toFixed(1);
          const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
          const pct = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : "?";
          process.stdout.write(`\r   Downloading: ${mb} MB / ${totalMb} MB (${pct}%)`);
          lastReport = now;
        }
      });

      res.pipe(fileStream);
      fileStream.on("finish", () => {
        console.log("");
        fileStream.close(() => resolve({ totalBytes: downloadedBytes, lastModified }));
      });
      fileStream.on("error", reject);
    });
    req.on("error", reject);
  });
}

function computeMd5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function run() {
  console.log(`[Acquisition] Querying Geofabrik index (index-v1.json)...`);
  const index = await fetchJSON("https://download.geofabrik.de/index-v1.json");

  // Filter features that cover India or specifically western-zone (Gujarat)
  const candidate = index.features.find((f) => f.properties.id === "western-zone");
  if (!candidate || !candidate.properties.urls || !candidate.properties.urls.pbf) {
    throw new Error("Could not find western-zone extract in Geofabrik index");
  }

  const pbfUrl = candidate.properties.urls.pbf;
  const md5Url = candidate.properties.urls.pbf + ".md5";
  const filename = path.basename(pbfUrl);
  const rawPbfPath = path.join(rawDir, filename);

  console.log(`[Acquisition] Selected extract: ${candidate.properties.name} (${candidate.properties.id})`);
  console.log(`              URL: ${pbfUrl}`);

  // Fetch expected MD5
  console.log(`[Acquisition] Fetching published MD5: ${md5Url}`);
  const md5Text = await fetchText(md5Url);
  const expectedMd5 = md5Text.split(/\s+/)[0].trim().toLowerCase();
  console.log(`              Expected MD5: ${expectedMd5}`);

  let lastModified = "";
  let fileSize = 0;

  // Check if existing file is already downloaded and verified
  if (fs.existsSync(rawPbfPath)) {
    console.log(`[Acquisition] File already exists at ${rawPbfPath}. Checking MD5...`);
    const currentMd5 = await computeMd5(rawPbfPath);
    if (currentMd5 === expectedMd5) {
      console.log(`[Acquisition] Local file matches expected MD5 (${currentMd5}). Reusing download.`);
      const stat = fs.statSync(rawPbfPath);
      fileSize = stat.size;
      lastModified = stat.mtime.toUTCString();
    } else {
      console.log(`[Acquisition] MD5 mismatch (${currentMd5} != ${expectedMd5}). Re-downloading...`);
      const res = await downloadFile(pbfUrl, rawPbfPath);
      fileSize = res.totalBytes;
      lastModified = res.lastModified;
    }
  } else {
    console.log(`[Acquisition] Downloading extract to ${rawPbfPath}...`);
    const res = await downloadFile(pbfUrl, rawPbfPath);
    fileSize = res.totalBytes;
    lastModified = res.lastModified;
  }

  // Verify checksum
  console.log(`[Acquisition] Verifying file checksum...`);
  const finalMd5 = await computeMd5(rawPbfPath);
  if (finalMd5 !== expectedMd5) {
    throw new Error(`Checksum verification failed! Expected ${expectedMd5}, computed ${finalMd5}`);
  }
  console.log(`[PASS] Checksum verified: ${finalMd5}`);

  const manifestPath = path.join(regionDir, "manifest.json");
  const manifest = {
    region: region.name,
    slug: region.slug,
    countryCode: region.countryCode,
    bbox: region.bbox,
    source: {
      url: pbfUrl,
      md5Url: md5Url,
      expectedMd5: expectedMd5,
      actualMd5: finalMd5,
      fileSizeBytes: fileSize,
      downloadTimestamp: new Date().toISOString(),
      osmDataTimestamp: lastModified,
      provider: "Geofabrik GmbH",
      license: "Open Database License (ODbL) 1.0",
    },
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[Acquisition] Manifest recorded at ${manifestPath}`);
}

run().catch((err) => {
  console.error(`[FAIL] Acquisition error:`, err);
  process.exit(1);
});
