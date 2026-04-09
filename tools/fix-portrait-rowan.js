/**
 * fix-portrait-rowan.js
 * Regenerates rowan.png as a proper full-body portrait.
 * Run: node tools/fix-portrait-rowan.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
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
  "Fantasy digital painting, full-body character portrait showing the ENTIRE figure from head to feet with space above the head and below the feet, " +
  "the character must be fully visible with no cropping at all, gritty semi-realistic RPG art style, " +
  "single subject only, exactly one character only, no duplicate figures, no split composition, no inset image, no collage, " +
  "no crowd, no companion, no background, transparent background, painterly rendering, rich earthy color palette, no text, no UI elements.";

const prompt =
  "A seasoned guildmaster named Rowan, a rugged middle-aged man with short brown hair streaked with grey and a neatly kept beard. " +
  "Wearing practical brown leather adventurer's gear upgraded for a town official, with a dark cloak and a small silver guild insignia clasp. " +
  "Carrying a rolled map case at his belt. Sturdy leather boots on his feet. Radiating calm authority, competence, and warmth. " +
  "Standing tall in a confident pose, full body visible from head to boots on the ground. " + STYLE;

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
  console.log("Regenerating rowan.png as full-body portrait...\n");

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const outPath = path.join(PORTRAIT_DIR, "rowan.png");
  const backupPath = path.join(BACKUP_DIR, "rowan.png");

  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log("  Backed up existing rowan.png");
  }

  console.log("  Generating rowan.png...");
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
    });

    const imageUrl = response.data[0].url;
    await downloadImage(imageUrl, outPath);
    console.log("  Saved rowan.png\n");
  } catch (err) {
    console.error(`  FAILED: ${err.message}\n`);
  }

  console.log("Done.");
}

generate();
