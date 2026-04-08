/**
 * generate-exploration-bg.js
 * Generates exploration node backgrounds with DALL-E 3.
 * Run: node tools/generate-exploration-bg.js
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
    filename: "explore-shady-path.png",
    prompt:
      "A narrow forest trail winding between enormous mossy oak trees. Dense canopy overhead " +
      "casts dappled shadows on the leaf-strewn path. Ferns and wildflowers grow along the edges. " +
      "Shafts of golden light pierce through gaps in the leaves. Mysterious and slightly foreboding. " + STYLE,
  },
  {
    filename: "explore-dark-thicket.png",
    prompt:
      "A dark dense thicket in a fantasy forest. Gnarled branches intertwine overhead blocking most light. " +
      "Thick undergrowth, twisted roots, and mushrooms on fallen logs. A faint eerie green glow from deep moss. " +
      "The path is barely visible, overgrown and menacing. Perfect spot for an ambush. " + STYLE,
  },
  {
    filename: "explore-bandit-clearing.png",
    prompt:
      "A small forest clearing with remnants of a bandit camp. A dead campfire with scattered logs for seats, " +
      "a torn canvas lean-to shelter, scattered empty crates and rope. The surrounding trees are scratched " +
      "with crude markings. Late afternoon light filtering through the tree line. " + STYLE,
  },
  {
    filename: "explore-rocky-pass.png",
    prompt:
      "A narrow rocky mountain pass through dark woods. Large boulders line either side of a dirt trail, " +
      "crude goblin totems and warning signs made of bones are nailed to dead trees. " +
      "Mist drifts low along the ground. Dark and ominous with distant torchlight. " + STYLE,
  },
  {
    filename: "explore-wolf-hollow.png",
    prompt:
      "A forest hollow surrounded by ancient trees with a rocky outcrop. Scattered animal bones, " +
      "a shallow den dug into the hillside, claw marks on birch trees. Early morning mist, " +
      "cold atmosphere. A wild dangerous place where wolves den. " + STYLE,
  },
  {
    filename: "explore-trails-end.png",
    prompt:
      "The end of a forest trail where it meets a dark rocky cliff face with a cave entrance visible " +
      "in the distance. Crude goblin fortifications — sharpened logs, rope barriers, and small watchtowers. " +
      "Torches flicker in iron sconces. Dusk sky with ominous clouds. " + STYLE,
  },
  {
    filename: "explore-overgrown-path.png",
    prompt:
      "An overgrown path leading to ancient stone ruins. Crumbling stone walls covered in ivy and moss, " +
      "a broken stone archway in the middle distance. Wildflowers growing through cracked flagstones. " +
      "Soft misty morning light with a melancholic abandoned atmosphere. " + STYLE,
  },
  {
    filename: "explore-watchtower.png",
    prompt:
      "A crumbling medieval stone watchtower interior, partially open to the sky. Broken wooden floors, " +
      "a spiral stone staircase missing steps, arrow slits in thick walls. " +
      "Vines growing through cracks, old guard equipment rusting on the walls. " +
      "Dramatic light from above through the collapsed roof. " + STYLE,
  },
  {
    filename: "explore-reed-banks.png",
    prompt:
      "Tall golden reeds and cattails along a wide river bank in a fantasy setting. A wooden fishing dock " +
      "extends into calm water reflecting the sky. Water lilies float on the surface. " +
      "Dragonflies hover in warm afternoon light. Serene but with hints of wild nature. " + STYLE,
  },
  {
    filename: "explore-rocky-pools.png",
    prompt:
      "A rocky area with natural tide pools beside a gentle river in a fantasy forest. Smooth river stones, " +
      "crystal clear shallow pools reflecting the sky, small waterfalls cascading between rocks. " +
      "Lush green ferns and moss cover everything. Peaceful sparkling afternoon sunlight. " + STYLE,
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
  console.log(`Generating ${backgrounds.length} exploration backgrounds with DALL-E 3...\n`);

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
