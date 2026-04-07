/**
 * Compress all PNG images in assets/ using sharp.
 * Usage:  node tools/compress-images.js
 *
 * - Overwrites originals in-place (back up first if needed).
 * - Skips files in assets/_originals/.
 * - Typically cuts 40-70 % off file size with no visible quality loss.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "..", "assets");
const SKIP_DIRS = ["_originals"];

async function collectPngs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      files = files.concat(await collectPngs(full));
    } else if (entry.isFile() && /\.png$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function compress(filePath) {
  const before = fs.statSync(filePath).size;
  const buf = await sharp(filePath)
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 80 })
    .toBuffer();

  // Only overwrite if we actually saved space
  if (buf.length < before) {
    fs.writeFileSync(filePath, buf);
    const pct = (((before - buf.length) / before) * 100).toFixed(1);
    console.log(`  ${path.relative(ASSETS_DIR, filePath)}  ${kb(before)} -> ${kb(buf.length)}  (-${pct}%)`);
    return before - buf.length;
  } else {
    console.log(`  ${path.relative(ASSETS_DIR, filePath)}  ${kb(before)} (already optimal)`);
    return 0;
  }
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

async function main() {
  const files = await collectPngs(ASSETS_DIR);
  console.log(`Found ${files.length} PNGs in assets/\n`);

  let totalSaved = 0;
  let skipped = 0;
  for (const f of files) {
    try {
      totalSaved += await compress(f);
    } catch (err) {
      console.log(`  ${path.relative(ASSETS_DIR, f)}  SKIPPED (${err.message})`);
      skipped++;
    }
  }
  if (skipped) console.log(`\nSkipped ${skipped} file(s) due to errors.`);

  console.log(`\nDone. Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
