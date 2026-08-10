/**
 * generate-date-backgrounds.js
 * Uses OpenAI DALL-E 3 to generate unique date location backgrounds.
 * Run: node tools/generate-date-backgrounds.js
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
const OUT_DIR = path.join(__dirname, "..", "assets", "backgrounds");

const STYLE =
  "Fantasy digital painting, richly detailed, atmospheric lighting, " +
  "painterly RPG game background, wide landscape format, no text, no UI elements, no characters.";

const backgrounds = [
  {
    filename: "date-riverside-moonlit.png",
    prompt:
      "A serene riverside scene at night in a medieval fantasy village. Moonlight reflects off gently flowing water, " +
      "glowing wildflowers line the banks, fireflies hover above the grass. A small stone bridge in the distance. " +
      "Warm and romantic atmosphere. " + STYLE,
  },
  {
    filename: "date-inn-dinner.png",
    prompt:
      "Interior of a cozy medieval fantasy inn set for an intimate dinner. A small table for two by a crackling fireplace, " +
      "warm candlelight, mugs of mead, a hearty stew on the table. Wooden beams overhead, tapestries on stone walls. " +
      "Inviting and romantic. " + STYLE,
  },
  {
    filename: "date-hilltop-stargazing.png",
    prompt:
      "A grassy hilltop overlooking a medieval fantasy village at night. A brilliant starry sky with visible constellations, " +
      "a crescent moon, the distant village glowing with warm lantern light below. A blanket spread on the grass. " +
      "Peaceful and romantic. " + STYLE,
  },
  {
    filename: "date-town-walls-sunset.png",
    prompt:
      "Walking along medieval fantasy town walls at golden sunset. Warm orange and pink sky, stone battlements, " +
      "a panoramic view of forests and rolling hills beyond. Lanterns being lit along the walkway. " +
      "Romantic and atmospheric. " + STYLE,
  },
  {
    filename: "date-evening-town-walk.png",
    prompt:
      "A quiet medieval fantasy village street in the evening. Warm lantern light from iron lampposts, cobblestone path, " +
      "flower boxes on cottage windows, a gentle mist. Fireflies and a warm amber glow. " +
      "Peaceful and intimate atmosphere. " + STYLE,
  },
  {
    filename: "date-market-square-evening.png",
    prompt:
      "A medieval fantasy market square in the evening after closing. Empty merchant stalls draped in colorful cloth, " +
      "string lanterns overhead casting warm pools of light, a stone fountain in the center. " +
      "Quiet, romantic, and nostalgic. " + STYLE,
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
  console.log(`Generating ${backgrounds.length} date backgrounds with DALL-E 3...\n`);

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
