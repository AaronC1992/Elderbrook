/**
 * fix-portrait-harlan.js
 * Regenerates harlan.png as a proper full-body portrait.
 * Run: node tools/fix-portrait-harlan.js
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
  "A serious battle-tested armorer named Harlan Stonevein, a tough stocky middle-aged man with short greying hair and a thick beard. " +
  "Wearing heavy plate armor over chainmail, with a thick leather apron over the top. Holding a helmet tucked under one arm. " +
  "Stern no-nonsense expression, scarred hands from years of metalwork. Heavy armored boots on his feet. " +
  "Standing in a wide planted stance, full body visible from head to armored boots on the ground. " + STYLE;

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
  console.log("Regenerating harlan.png as full-body portrait...\n");

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const outPath = path.join(PORTRAIT_DIR, "harlan.png");
  const backupPath = path.join(BACKUP_DIR, "harlan.png");

  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log("  Backed up existing harlan.png");
  }

  console.log("  Generating harlan.png...");
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
    console.log("  Saved harlan.png\n");
  } catch (err) {
    console.error(`  FAILED: ${err.message}\n`);
  }

  console.log("Done.");
}

generate();
