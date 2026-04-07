/**
 * generate-portraits-retry.js
 * Retry generation for goblin guard and wolf pack leader with adjusted prompts.
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
  "Fantasy digital painting, detailed full-body character portrait, " +
  "gritty semi-realistic RPG art style, solid white background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const portraits = [
  {
    filename: "goblin-guard-enemy.png",
    prompt:
      "A stout fantasy goblin warrior standing guard. Green-skinned, short and muscular, " +
      "wearing heavy iron plate armor pieced together from mismatched metal scraps. " +
      "Holds a dented iron shield in one hand and a short broad sword in the other. " +
      "Flat nose, small yellow eyes, determined expression. A disciplined soldier among goblins. " + STYLE,
  },
  {
    filename: "wolf-pack-leader-enemy.png",
    prompt:
      "A large alpha wolf standing in a dominant posture. Thick dark grey fur with a heavy mane-like ruff " +
      "around the neck. Larger and more muscular than an ordinary wolf. Piercing amber eyes " +
      "showing intelligence and authority. One ear has a small notch from old encounters. " +
      "A majestic and powerful wild animal. " + STYLE,
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
  console.log(`Retrying ${portraits.length} portraits...\n`);

  for (const p of portraits) {
    const outPath = path.join(OUT_DIR, p.filename);
    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${p.filename} (already exists)`);
      continue;
    }

    console.log(`  GEN   ${p.filename} ...`);
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: p.prompt,
        n: 1,
        size: "1024x1792",
        quality: "standard",
      });
      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, outPath);
      console.log(`  SAVED ${p.filename}`);
    } catch (err) {
      console.error(`  FAIL  ${p.filename}: ${err.message}`);
    }
  }
  console.log("\nDone!");
}

generate();
