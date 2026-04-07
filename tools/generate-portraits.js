/**
 * generate-portraits.js
 * Uses OpenAI DALL-E 3 to generate missing character portraits.
 * Run: node tools/generate-portraits.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { OpenAI } = require("openai");

// Load .env manually (no dotenv dependency)
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const OUT_DIR = path.join(__dirname, "..", "assets", "portraits");

// Shared style suffix matching existing portrait art
const STYLE =
  "Fantasy digital painting, detailed full-body character portrait, " +
  "gritty semi-realistic RPG art style, solid white background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const portraits = [
  {
    filename: "goblin-guard-enemy.png",
    prompt:
      "A heavily armored goblin guard standing in a defensive posture. " +
      "Larger and stockier than a normal goblin, wearing crude but functional iron plate armor " +
      "cobbled together from stolen human equipment. Carries a heavy iron shield with dents and scratches " +
      "and a short broad-bladed sword. Scarred green skin, a flat broken nose, and small menacing yellow eyes. " +
      "Battle-hardened and disciplined compared to other goblins. " + STYLE,
  },
  {
    filename: "wolf-pack-leader-enemy.png",
    prompt:
      "A massive alpha wolf, significantly larger than a normal wolf, with thick dark grey-black fur " +
      "and a prominent scarred muzzle. Piercing amber eyes with intelligence behind them. " +
      "A heavy muscular build with a thick ruff of fur around the neck like a mane. " +
      "Standing in an aggressive dominant posture, baring large fangs, one ear torn from old battles. " +
      "Exudes authority and danger. " + STYLE,
  },
  {
    filename: "lost-child.png",
    prompt:
      "A small medieval fantasy village child, around 8 years old, with messy brown hair and big worried eyes. " +
      "Wearing a simple patched linen tunic and small leather boots. " +
      "Clutching a small wooden toy cat. Looking up with a hopeful but anxious expression. " +
      "Rosy cheeks, a smudge of dirt on one cheek. Small and innocent against a dangerous world. " + STYLE,
  },
  {
    filename: "cheerful-villager.png",
    prompt:
      "A cheerful middle-aged medieval village woman decorating for a festival. " +
      "Wearing a clean colorful dress with an embroidered apron, hair pinned up with a flower tucked behind one ear. " +
      "Holding a garland of autumn flowers and ribbons. Warm genuine smile, laugh lines around bright eyes. " +
      "Rosy complexion, sturdy build. Radiates warmth and community spirit. " + STYLE,
  },
  {
    filename: "villager_male.png",
    prompt:
      "A sturdy medieval fantasy village man, a farmer or laborer in his 30s. " +
      "Wearing a simple brown tunic with rolled-up sleeves, a leather belt, and worn boots. " +
      "Broad shouldered with calloused hands, a short beard, and honest weathered features. " +
      "Carrying a sack of grain over one shoulder. A dependable common folk look. " + STYLE,
  },
  {
    filename: "cloaked-figure.png",
    prompt:
      "A sinister mysterious cloaked figure standing in shadow. Wearing a deep black hooded cloak " +
      "that obscures most of the face, only a sharp jawline and thin lips visible beneath the hood. " +
      "Dark leather gloves, a silver clasp shaped like an ancient arcane symbol holding the cloak together. " +
      "One hand partially extended as if studying something invisible. " +
      "An aura of danger and hidden knowledge. Unnervingly still posture. " + STYLE,
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
  console.log(`Generating ${portraits.length} portraits with DALL-E 3...\n`);

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
