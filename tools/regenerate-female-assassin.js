/**
 * regenerate-female-assassin.js
 * Re-generates female_player_assassin.png with gpt-image-1 — single full-body figure, transparent bg.
 * Run: node tools/regenerate-female-assassin.js
 */
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const ROOT_DIR = path.join(__dirname, "..");
const PORTRAIT_DIR = path.join(ROOT_DIR, "assets", "portraits");
const BACKUP_DIR = path.join(ROOT_DIR, "assets", "_originals", "portraits");

const envPath = path.join(ROOT_DIR, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const STYLE =
  "Fantasy digital painting, anime-influenced semi-realistic RPG character art style with bold outlines and clean shading, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements. " +
  "Illustrated character design like a JRPG or visual novel sprite. NOT photorealistic.";

const prompt =
  "A single illustrated full-body character: a lean female assassin in dark fitted leather armor " +
  "with a deep hood partially shadowing her face. Twin daggers strapped to her belt, " +
  "throwing knives on a chest bandolier. Sharp calculating eyes, angular features. " +
  "Poised catlike stance ready to strike. Dark color scheme with subtle dark red accents. " +
  "Wearing dark leather boots that are fully visible at the bottom. " +
  "Full body character portrait showing the entire figure from head to feet, " +
  "legs and feet naturally visible, no cropping. " +
  "Only one single character in the image, centered in frame. No concept art sheet, no multiple views, no turnaround. " + STYLE;

async function generate() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const outPath = path.join(PORTRAIT_DIR, "female_player_assassin.png");
  const backupPath = path.join(BACKUP_DIR, "female_player_assassin.png");

  // Backup existing
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log("  Backed up existing female_player_assassin.png");
  }

  console.log("  GEN   female_player_assassin.png ...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1536",
      background: "transparent",
      output_format: "png",
    });

    const base64Data = response.data[0].b64_json;
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(outPath, buffer);
    console.log("  SAVED female_player_assassin.png");
  } catch (err) {
    console.error(`  FAIL  female_player_assassin.png: ${err.message}`);
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, outPath);
      console.log("  Restored backup.");
    }
  }

  console.log("\nDone!");
}

generate();
