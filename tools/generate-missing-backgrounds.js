/**
 * generate-missing-backgrounds.js
 * Generates backgrounds for screens that are currently missing them:
 *   - Academy, Character Creation, Chapter End
 * Run: node tools/generate-missing-backgrounds.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { OpenAI } = require("openai");

// Load .env manually
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const OUT_DIR = path.join(__dirname, "..", "assets", "backgrounds");

const STYLE =
  "Fantasy digital painting, richly detailed, atmospheric lighting, " +
  "painterly RPG game background, wide landscape format, no text, no UI elements, no characters.";

const backgrounds = [
  {
    filename: "main-town-academy.png",
    prompt:
      "The interior of a medieval fantasy academy library and study hall. " +
      "Tall wooden bookshelves filled with ancient tomes and scrolls line the walls. " +
      "A large arched window lets in warm golden light. Ornate candelabras and floating magical orbs " +
      "provide soft illumination. A heavy oak desk with open spellbooks and ink pots sits in the foreground. " +
      "Arcane symbols glow faintly on the stone walls. Cozy but scholarly atmosphere. " + STYLE,
  },
  {
    filename: "character-creation.png",
    prompt:
      "A dramatic medieval fantasy forge and altar room where a hero's journey begins. " +
      "A stone pedestal in the center holds a glowing crystal orb emanating soft blue light. " +
      "Behind it, weapon racks display swords, bows, daggers, and staves. " +
      "Ancient banners hang from the vaulted stone ceiling. Warm firelight from a forge " +
      "mixes with cool magical glow. Dust motes float in shafts of light from high windows. " +
      "A sense of destiny and new beginnings. " + STYLE,
  },
  {
    filename: "chapter-end.png",
    prompt:
      "A serene medieval fantasy hilltop at golden hour overlooking a distant village and rolling countryside. " +
      "A lone ancient oak tree stands at the summit with light filtering through its branches. " +
      "The sky is painted in warm golds, soft purples, and gentle pinks of sunset. " +
      "Wildflowers dot the grassy hillside. A feeling of accomplishment and peaceful reflection. " + STYLE,
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
  console.log(`Generating ${backgrounds.length} backgrounds with DALL-E 3...\n`);

  for (const bg of backgrounds) {
    const outPath = path.join(OUT_DIR, bg.filename);

    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${bg.filename} (already exists)`);
      continue;
    }

    console.log(`  GEN   ${bg.filename} ...`);
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: bg.prompt,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, outPath);
      console.log(`  SAVED ${bg.filename}`);
    } catch (err) {
      console.error(`  FAIL  ${bg.filename}: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

generate();
