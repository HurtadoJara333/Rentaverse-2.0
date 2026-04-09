#!/usr/bin/env node
/**
 * RentaVerse — Model Downloader
 * Downloads the Khronos ToyCar (CC0) as a base placeholder for all slots.
 * Replace each file with a real GLB from the links below for production quality.
 */
const https = require("https");
const fs    = require("fs");
const path  = require("path");

const MODELS_DIR = path.join(__dirname, "../public/models");
if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });

// CC0 placeholder — Khronos ToyCar (tiny but valid GLB with PBR materials)
const PLACEHOLDER_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb";

// Files expected by the app
const MODEL_FILES = [
  "car_mazda_cx5.glb",
  "car_mazda3.glb",
  "car_tracker.glb",
  "car_onix.glb",
  "car_duster.glb",
];

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE THESE with real models downloaded from Sketchfab (free, CC-BY):
//
//  car_mazda_cx5.glb  → https://sketchfab.com/3d-models/mazda-cx-5-2019-free-download
//  car_mazda3.glb     → https://sketchfab.com/3d-models/mazda-3-2019-free
//  car_tracker.glb    → https://sketchfab.com/3d-models/chevrolet-tracker-2021
//  car_onix.glb       → https://sketchfab.com/3d-models/chevrolet-onix-2020-free
//  car_duster.glb     → https://sketchfab.com/3d-models/renault-duster-2018-free
//
// Steps: Login → Download → Auto-convert to glTF → rename → drop in /public/models/
//
// Alternative (no login needed): https://poly.pizza/search/car  (CC0)
// ─────────────────────────────────────────────────────────────────────────────

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  ✓ Already exists: ${path.basename(dest)}`);
      return resolve();
    }
    console.log(`  ↓ Downloading placeholder → ${path.basename(dest)}`);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => { try { fs.unlinkSync(dest); } catch(_){} reject(err); });
  });
}

async function main() {
  console.log("\n🚗 RentaVerse — Downloading model placeholders\n");
  for (const name of MODEL_FILES) {
    await download(PLACEHOLDER_URL, path.join(MODELS_DIR, name)).catch(e =>
      console.warn(`  ✗ ${name}: ${e.message}`)
    );
  }
  console.log(`
✅ Done! All slots have a placeholder model (Khronos ToyCar CC0).

📌 For realistic models, replace each file in /public/models/ with a GLB
   downloaded from Sketchfab (free, CC-BY). See comments in this script
   for direct links to Mazda / Chevrolet / Renault models.
`);
}

main();
