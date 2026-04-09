/**
 * regenerate-fullbody.js
 * Regenerates specific portraits that were cut off, ensuring full-body framing.
 * Run: node tools/regenerate-fullbody.js
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

const targets = [
  {
    filename: "cedric.png",
    prompt:
      "A holy paladin named Sir Cedric, a tall imposing man in his late 30s with a square jaw and short blond hair. " +
      "Wearing gleaming golden-trimmed white plate armor with sacred engravings covering his full body down to armored greaves and sabatons on his feet. " +
      "A massive two-handed warhammer resting on his shoulder. A golden holy symbol hangs from his neck. " +
      "Serious righteous expression, piercing blue eyes, scars visible on his hands from years of battle against darkness. " +
      "An aura of divine authority. Full body visible from head to armored boots, standing tall on the ground. " + STYLE,
  },
  {
    filename: "cheerful-villager.png",
    prompt:
      "A cheerful middle-aged medieval village woman decorating for a festival. " +
      "Wearing a clean colorful dress with an embroidered apron, hair pinned up with a flower tucked behind one ear. " +
      "Holding a garland of autumn flowers and ribbons. Warm genuine smile, laugh lines around bright eyes. " +
      "Rosy complexion, sturdy build. Radiates warmth and community spirit. " +
      "Wearing simple leather shoes or boots on her feet. Full body visible from head to feet, standing on the ground. " + STYLE,
  },
];

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
  console.log(`Regenerating ${targets.length} portraits as full-body with DALL-E 3...\n`);

  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  for (const t of targets) {
    const outPath = path.join(PORTRAIT_DIR, t.filename);
    const backupPath = path.join(BACKUP_DIR, t.filename);

    // Backup existing portrait
    if (fs.existsSync(outPath)) {
      fs.copyFileSync(outPath, backupPath);
      console.log(`  Backed up existing ${t.filename}`);
    }

    console.log(`  Generating ${t.filename}...`);
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: t.prompt,
        n: 1,
        size: "1024x1792",
        quality: "hd",
      });

      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, outPath);
      console.log(`  Saved ${t.filename}\n`);
    } catch (err) {
      console.error(`  FAILED ${t.filename}: ${err.message}\n`);
    }
  }

  console.log("Done.");
}

generate();
