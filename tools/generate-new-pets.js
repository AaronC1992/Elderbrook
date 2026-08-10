/**
 * generate-new-pets.js
 * Generates portraits for the new merchant-exclusive pets added in the pet overhaul.
 * Run: node tools/generate-new-pets.js
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
const PORTRAIT_DIR = path.join(__dirname, "..", "assets", "portraits");

const STYLE =
  "Fantasy digital painting, detailed character portrait, " +
  "gritty semi-realistic RPG art style, transparent background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const images = [
  {
    filename: "pet-shadow-hound.png",
    prompt:
      "A spectral shadow hound companion, a medium-sized dog made of wisps of dark purple-black shadow energy. " +
      "Glowing violet eyes, smoky translucent fur that trails darkness, sharp ethereal fangs. " +
      "Loyal but eerie, a creature from the shadow realm serving as a faithful companion. " + STYLE,
  },
  {
    filename: "pet-frost-serpent.png",
    prompt:
      "A small magical frost serpent coiled and alert. Icy blue-white crystalline scales that shimmer, " +
      "pale frost-blue eyes, delicate ice crystals forming along its spine and hood. " +
      "Cold mist curling from its mouth. An elegant and dangerous magical companion. " + STYLE,
  },
  {
    filename: "pet-golden-hawk.png",
    prompt:
      "A majestic golden hawk with brilliant gold and bronze plumage, fierce amber eyes, " +
      "and a sharp curved beak. Wings half-spread showing iridescent golden feathers. " +
      "A thin ornate gold band around one leg. Regal and proud, a noble's prized hunting bird. " + STYLE,
  },
  {
    filename: "pet-ember-sprite.png",
    prompt:
      "A tiny fire elemental sprite, a small humanoid figure made of living flame and glowing embers. " +
      "Bright orange-red body with flickering flame hair, tiny spark-like eyes full of mischief. " +
      "Floating slightly off the ground with embers trailing behind. A playful magical companion. " + STYLE,
  },
  {
    filename: "pet-baby-dragon.png",
    prompt:
      "An adorable but fierce baby dragon sitting proudly. Deep crimson-red scales with golden underbelly, " +
      "small leathery wings folded at its sides, tiny curved horns, bright molten-gold eyes. " +
      "A wisp of smoke curling from its nostrils. Small but clearly powerful, " +
      "a legendary companion that will grow into something terrifying. " + STYLE,
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
  console.log(`Generating ${images.length} new pet portraits with DALL-E 3...\n`);

  for (const img of images) {
    const outPath = path.join(PORTRAIT_DIR, img.filename);

    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${img.filename} (already exists)`);
      continue;
    }

    console.log(`  GEN   ${img.filename} ...`);
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: img.prompt,
        n: 1,
        size: "1024x1792",
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, outPath);
      console.log(`  SAVED ${img.filename}`);
    } catch (err) {
      console.error(`  FAIL  ${img.filename}: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

generate();
