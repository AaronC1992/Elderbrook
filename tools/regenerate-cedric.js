/**
 * regenerate-cedric.js
 * Regenerates cedric.png with transparent background, full-body, single character.
 * Run: node tools/regenerate-cedric.js
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
  "Fantasy digital painting, detailed full-body character portrait from head to feet, " +
  "gritty semi-realistic RPG art style, transparent background, no background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements, single character only.";

const portrait = {
  filename: "cedric.png",
  prompt:
    "A character design reference sheet showing one single paladin knight standing upright, " +
    "entire figure visible in frame from the crown of his head down to the soles of his armored boots on the ground. " +
    "He is an older weathered warrior with grey-streaked dark hair and a trimmed beard. " +
    "Silver and gold plate armor with sun emblems, a white tabard with a radiant dawn crest. " +
    "Longsword at hip, shield on back. Solemn noble expression. " +
    "Wide shot, zoomed out, plenty of empty space above head and below feet. " +
    STYLE,
};

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
  const outPath = path.join(OUT_DIR, portrait.filename);

  // Back up existing file (only first time)
  const backupDir = path.join(OUT_DIR, "..", "_originals", "portraits");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, portrait.filename);
  if (fs.existsSync(outPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(outPath, backupPath);
    console.log(`  Backed up original to _originals/portraits/${portrait.filename}`);
  }

  console.log(`  GEN   ${portrait.filename} ...`);
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: portrait.prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    await downloadImage(imageUrl, outPath);
    console.log(`  SAVED ${portrait.filename}`);
  } catch (err) {
    console.error(`  FAIL  ${portrait.filename}: ${err.message}`);
  }
}

generate();
