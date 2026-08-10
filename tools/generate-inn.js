/**
 * generate-inn.js
 * Generates inn interior background + innkeeper portrait using DALL-E 3.
 * Run: node tools/generate-inn.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { OpenAI } = require("openai");

// Load .env
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const BG_STYLE =
  "Fantasy digital painting, richly detailed, atmospheric lighting, " +
  "painterly RPG game background, wide landscape format, no text, no UI elements, no characters.";

const PORTRAIT_STYLE =
  "Fantasy digital painting, detailed full-body character portrait, " +
  "gritty semi-realistic RPG art style, transparent background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const assets = [
  {
    filename: path.join("assets", "backgrounds", "main-town-inn.png"),
    size: "1792x1024",
    prompt:
      "Interior of a cozy medieval fantasy tavern inn. A large stone fireplace with a roaring fire " +
      "dominates one wall, casting warm amber light across the room. Worn wooden tables and chairs " +
      "are scattered about, some with half-finished mugs of ale. A long wooden bar counter with " +
      "barrels of ale stacked behind it. Candle chandeliers hang from thick oak ceiling beams. " +
      "The walls are decorated with hunting trophies, old swords, and faded tapestries. " +
      "Warm inviting atmosphere with rich golden-brown tones. A staircase leads to rooms upstairs. " +
      BG_STYLE,
  },
  {
    filename: path.join("assets", "portraits", "innkeeper.png"),
    size: "1024x1792",
    prompt:
      "A burly, friendly medieval fantasy innkeeper. A stout middle-aged man with a thick brown beard, " +
      "rosy cheeks, and kind crinkled eyes. Wearing a cream-colored linen shirt with rolled-up sleeves, " +
      "a brown leather apron stained from years of work, and sturdy boots. " +
      "Has massive forearms from years of hauling kegs. Holding a polished pewter tankard in one hand " +
      "and a rag draped over his shoulder. A warm, welcoming smile on his face. " +
      "Approachable and trustworthy, the kind of person everyone confides in. " +
      PORTRAIT_STYLE,
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
  console.log(`Generating ${assets.length} inn assets with DALL-E 3...\n`);

  for (const asset of assets) {
    const outPath = path.join(__dirname, "..", asset.filename);

    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${asset.filename} (already exists)`);
      continue;
    }

    console.log(`  GEN   ${asset.filename} ...`);
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: asset.prompt,
        n: 1,
        size: asset.size,
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      await downloadImage(imageUrl, outPath);
      console.log(`  SAVED ${asset.filename}`);
    } catch (err) {
      console.error(`  FAIL  ${asset.filename}: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

generate();
