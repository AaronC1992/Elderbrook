/**
 * regenerate-cloaked-figure.js
 * Re-generates cloaked-figure.png with gpt-image-1 — single full-body figure, transparent bg.
 * Run: node tools/regenerate-cloaked-figure.js
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
  "A single illustrated full-body character: a sinister mysterious cloaked figure standing upright. " +
  "Wearing a deep black hooded cloak that obscures most of the face, only a sharp jawline and thin lips visible beneath the hood. " +
  "Dark leather gloves, a silver clasp shaped like an ancient arcane symbol holding the cloak together at the chest. " +
  "One hand partially extended as if studying something invisible. " +
  "An aura of danger and hidden knowledge. Unnervingly still posture. " +
  "The long cloak flows down past the knees to dark leather boots planted firmly on the ground. " +
  "Full body character portrait showing the entire figure from the top of the hood to the soles of the boots, " +
  "legs and feet connected naturally to the body, no floating or detached elements. " +
  "Only one single character in the image, centered in frame. No concept art sheet, no multiple views, no turnaround. " + STYLE;

async function generate() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const outPath = path.join(PORTRAIT_DIR, "cloaked-figure.png");
  const backupPath = path.join(BACKUP_DIR, "cloaked-figure.png");

  // Backup existing
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log("  Backed up existing cloaked-figure.png");
  }

  console.log("  GEN   cloaked-figure.png ...");
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
    console.log("  SAVED cloaked-figure.png");
  } catch (err) {
    console.error(`  FAIL  cloaked-figure.png: ${err.message}`);
    // Restore backup on failure
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, outPath);
      console.log("  Restored backup.");
    }
  }

  console.log("\nDone!");
}

generate();
