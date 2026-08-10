/**
 * regenerate-cindra.js
 * Re-generates cindra.png with DALL-E 3 — single full-body figure, transparent bg.
 * Run: node tools/regenerate-cindra.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { OpenAI } = require("openai");

const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const OUT_DIR = path.join(__dirname, "..", "assets", "portraits");

const STYLE =
  "Fantasy digital painting, gritty semi-realistic RPG art style, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const prompt =
  "A single standing figure of a fiery pyromancer woman in her mid-20s with wild crimson-red hair " +
  "flickering like flame at the tips. She wears dark red and black robes with ember-like patterns, " +
  "belted at the waist, ending above dark leather boots that are fully visible. " +
  "One hand casually holds a small dancing flame. Amber eyes, intense gaze, slight burn scars on hands. " +
  "Confident pose, daring half-smile. Full body portrait showing her entire figure from head to feet, " +
  "both boots clearly visible at the bottom of the image. Do not crop or cut off the legs or feet. " +
  "Only one single character in the image, centered in frame. No concept art, no multiple views. " + STYLE;

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on("finish", () => { file.close(); resolve(); });
        }).on("error", reject);
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function generate() {
  const outPath = path.join(OUT_DIR, "cindra.png");
  const backupPath = path.join(OUT_DIR, "cindra_old.png");

  // Backup existing
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    fs.unlinkSync(outPath);
    console.log("  Backed up existing cindra.png -> cindra_old.png");
  }

  console.log("  GEN   cindra.png ...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1536",
      background: "transparent",
      output_format: "png",
    });

    // gpt-image-1 returns base64 data instead of a URL
    const base64Data = response.data[0].b64_json;
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(outPath, buffer);
    console.log("  SAVED cindra.png");
  } catch (err) {
    console.error(`  FAIL  cindra.png: ${err.message}`);
    // Restore backup on failure
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, outPath);
      console.log("  Restored backup.");
    }
  }

  console.log("\nDone!");
}

generate();
