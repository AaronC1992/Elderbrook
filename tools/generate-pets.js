/**
 * generate-pets.js
 * Uses OpenAI DALL-E 3 to generate pet portraits and pet shop background.
 * Run: node tools/generate-pets.js
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

const PORTRAIT_DIR = path.join(__dirname, "..", "assets", "portraits");
const BG_DIR = path.join(__dirname, "..", "assets", "backgrounds");

const STYLE_PORTRAIT =
  "Fantasy digital painting, detailed character portrait, " +
  "gritty semi-realistic RPG art style, transparent background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const STYLE_BG =
  "Fantasy digital painting, richly detailed, atmospheric lighting, " +
  "painterly RPG game background, wide landscape format, no text, no UI elements, no characters.";

const images = [
  // ── Pet Portraits ──
  {
    dir: PORTRAIT_DIR,
    filename: "pet-timber-wolf.png",
    size: "1024x1792",
    prompt:
      "A loyal young timber wolf companion sitting obediently, medium-sized with thick grey-brown fur, " +
      "alert amber eyes, a leather collar with a small iron tag. Friendly but fierce, ears perked up. " +
      "A trusty adventuring companion. " + STYLE_PORTRAIT,
  },
  {
    dir: PORTRAIT_DIR,
    filename: "pet-barn-owl.png",
    size: "1024x1792",
    prompt:
      "A beautiful barn owl perched and ready, with golden-brown speckled feathers and a white heart-shaped face. " +
      "Large dark intelligent eyes, talons gripping a small leather falconer's perch strap. " +
      "A wise magical companion animal. " + STYLE_PORTRAIT,
  },
  {
    dir: PORTRAIT_DIR,
    filename: "pet-tabby-cat.png",
    size: "1024x1792",
    prompt:
      "A scrappy orange tabby cat sitting with a confident swagger, bright green eyes, " +
      "a notched ear from old scraps, wearing a tiny leather collar with a copper bell. " +
      "Street-smart and loyal, a charming rogue's companion. " + STYLE_PORTRAIT,
  },
  {
    dir: PORTRAIT_DIR,
    filename: "pet-raven.png",
    size: "1024x1792",
    prompt:
      "A sleek black raven with glossy iridescent feathers perched with one wing slightly spread. " +
      "Piercing intelligent dark eyes, a sharp beak, and an arcane silver band around one leg. " +
      "Mysterious and clever, a mage's familiar. " + STYLE_PORTRAIT,
  },
  {
    dir: PORTRAIT_DIR,
    filename: "pet-fox-kit.png",
    size: "1024x1792",
    prompt:
      "An adorable young red fox kit with bright orange-red fur, a white-tipped bushy tail, " +
      "and big curious dark eyes. Wearing a tiny green bandana around its neck. " +
      "Playful and quick, an agile scout companion. " + STYLE_PORTRAIT,
  },
  {
    dir: PORTRAIT_DIR,
    filename: "pet-ferret.png",
    size: "1024x1792",
    prompt:
      "A sleek dark-furred ferret with bright beady eyes and a mischievous expression. " +
      "Long sinuous body, tiny paws, wearing a miniature leather harness. " +
      "A thief's best friend, quick and sneaky. " + STYLE_PORTRAIT,
  },
  // ── Pet Shop NPC Portrait ──
  {
    dir: PORTRAIT_DIR,
    filename: "pet-shop-keeper.png",
    size: "1024x1792",
    prompt:
      "A kind elderly woman running a fantasy pet shop. Wild curly grey hair with feathers and small flowers woven in. " +
      "Weathered but warm face with bright hazel eyes and deep laugh lines. " +
      "Wearing a patched leather apron with various pouches and a small bird perched on her shoulder. " +
      "Gentle earth-mother energy, clearly beloved by animals. " + STYLE_PORTRAIT,
  },
  // ── Pet Shop Background ──
  {
    dir: BG_DIR,
    filename: "main-town-pet-shop.png",
    size: "1792x1024",
    prompt:
      "Interior of a cozy medieval fantasy pet shop. Warm lantern light illuminates wooden shelves " +
      "lined with animal care supplies, leather collars, bags of feed, and small cages. " +
      "A stone fireplace in the corner. Straw on the wooden floor. Bird perches hanging from the ceiling. " +
      "Small animal pens visible along the walls. Jars of treats on the counter. " +
      "Rustic, warm, and inviting. " + STYLE_BG,
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
  console.log(`Generating ${images.length} pet images with DALL-E 3...\n`);

  for (const img of images) {
    const outPath = path.join(img.dir, img.filename);

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
        size: img.size,
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
