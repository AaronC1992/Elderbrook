/**
 * generate-backgrounds.js
 * Uses OpenAI DALL-E 3 to generate missing game backgrounds.
 * Run: node tools/generate-backgrounds.js
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

const OUT_DIR = path.join(__dirname, "..", "assets", "backgrounds");

// Shared style suffix for consistency with existing art
const STYLE =
  "Fantasy digital painting, richly detailed, atmospheric lighting, " +
  "painterly RPG game background, wide landscape format, no text, no UI elements, no characters.";

const backgrounds = [
  {
    filename: "battle-forest-road.png",
    prompt:
      "A tense forest clearing ready for combat. Tall ancient trees form a natural arena, " +
      "dappled sunlight filtering through the canopy. Fallen logs and mossy rocks provide cover. " +
      "The atmosphere is charged and dangerous. " + STYLE,
  },
  {
    filename: "battle-goblin-trail.png",
    prompt:
      "A rough dirt trail through dark tangled woods marked with crude goblin totems and claw marks on trees. " +
      "Torches stuck in the ground cast flickering orange light. The path is narrow and ambush-prone. " + STYLE,
  },
  {
    filename: "battle-cave.png",
    prompt:
      "Inside a dark goblin cave, a rocky chamber lit by glowing mushrooms and scattered torches. " +
      "Stalactites hang from the ceiling, crude goblin weapons are embedded in the walls. " +
      "An eerie green-tinged underground battle arena. " + STYLE,
  },
  {
    filename: "battle-watch-post.png",
    prompt:
      "The ruins of a medieval watchtower courtyard overrun by goblins. Broken wooden barricades, " +
      "a crumbling stone tower in the background, scattered guard equipment and old banners. " +
      "Dusk lighting with an ominous sky. " + STYLE,
  },
  {
    filename: "battle-riverbank.png",
    prompt:
      "A wide riverbank clearing with shallow water and river stones. Tall reeds and wildflowers " +
      "on the banks, a wooden footbridge partially destroyed. Soft morning mist rising from the water. " +
      "Peaceful but with underlying tension. " + STYLE,
  },
  {
    filename: "merchant-camp.png",
    prompt:
      "A cozy traveling merchant's roadside camp at the edge of a medieval fantasy town. " +
      "A colorful covered wagon with goods hanging from it, a small campfire, crates and barrels " +
      "of exotic wares, lanterns strung between poles. Warm inviting evening light. " + STYLE,
  },
  {
    filename: "main-town-festival.png",
    prompt:
      "A charming medieval fantasy village transformed for a harvest festival celebration. " +
      "Colorful cloth banners and bunting strung between timber-framed buildings, " +
      "flower garlands wrapped around lampposts, wooden market stalls with autumn produce and pumpkins, " +
      "strings of warm glowing lanterns above the cobblestone streets, barrels of cider and festive decorations. " +
      "The same cozy village architecture but dressed up for celebration. Golden autumn afternoon light. " + STYLE,
  },
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
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
