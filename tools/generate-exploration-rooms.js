/**
 * generate-exploration-rooms.js
 * Generates backgrounds for new exploration rooms (branching paths).
 * Run: node tools/generate-exploration-rooms.js
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
  // ── Forest Road (5 new rooms) ──
  {
    filename: "explore-mossy-ravine.png",
    prompt:
      "A deep mossy ravine in an ancient forest, steep rocky walls covered in thick green moss and hanging ferns. " +
      "A narrow path winds along the bottom beside a trickling stream. Shafts of pale light filter down from above. " +
      "Fallen trees bridge the gap overhead. Mysterious and slightly oppressive atmosphere. " + STYLE,
  },
  {
    filename: "explore-hidden-grove.png",
    prompt:
      "A secret grove hidden deep within a dense forest, accessed by descending stone steps carved into a hillside. " +
      "Ancient trees with luminous amber leaves form a natural canopy. Soft golden light filters through. " +
      "Mushrooms and wildflowers dot the forest floor. An enchanted, secluded atmosphere. " + STYLE,
  },
  {
    filename: "explore-tangled-roots.png",
    prompt:
      "A dark forest path choked with massive exposed tree roots that twist and intertwine across the ground. " +
      "The roots are thick enough to walk on. Bioluminescent fungi grow in the crevices casting eerie blue-green light. " +
      "Dense canopy blocks most sunlight. Claustrophobic and dangerous feel. " + STYLE,
  },
  {
    filename: "explore-ancient-hollow.png",
    prompt:
      "The hollow interior of an enormous ancient tree, large enough to walk inside. " +
      "The walls are smooth aged wood with carved runes that faintly glow. Roots form natural shelves and alcoves. " +
      "A gap in the canopy above lets in a column of dusty light. Sacred and ancient atmosphere. " + STYLE,
  },
  {
    filename: "explore-deepwood-den.png",
    prompt:
      "The deepest part of a primeval forest where no sunlight reaches the floor. " +
      "Massive gnarled trees with bark like twisted faces. Glowing eyes peer from the shadows. " +
      "Strange luminous plants provide the only light. Thick fog rolls across the ground. " +
      "Extremely dangerous and foreboding atmosphere. " + STYLE,
  },

  // ── Goblin Trail (3 new rooms) ──
  {
    filename: "explore-goblin-camp.png",
    prompt:
      "A hidden goblin encampment in a rocky canyon. Crude hide tents and lean-tos cluster around smoldering fire pits. " +
      "Sharpened stakes and crude wooden barricades form a perimeter. Goblin war banners and skulls on poles. " +
      "Scattered weapons and stolen supplies. Smoky, threatening atmosphere. " + STYLE,
  },
  {
    filename: "explore-totemic-shrine.png",
    prompt:
      "A dark clearing in twisted woods dominated by a towering goblin totem pole carved from a dead tree. " +
      "Crude offerings of bones and trinkets surround the base. Strange symbols painted on nearby rocks in red pigment. " +
      "Green-tinged torchlight. Ritualistic and unsettling atmosphere. " + STYLE,
  },
  {
    filename: "explore-warchief-ground.png",
    prompt:
      "A large rocky arena-like clearing used as a goblin warchief's proving ground. " +
      "A crude throne made of weapons and bones sits on a raised stone platform. " +
      "Battle-scarred earth, broken weapons, and crude war trophies. Torches mounted on tall poles. " +
      "Imposing and battle-hardened atmosphere. " + STYLE,
  },

  // ── Watch Post (3 new rooms) ──
  {
    filename: "explore-collapsed-barracks.png",
    prompt:
      "The ruins of a medieval guard barracks, half collapsed with stone walls crumbling. " +
      "Broken wooden bunk frames, scattered armor pieces, and old weapon racks. " +
      "Vines and moss reclaim the structure. A hole in the floor reveals stairs leading down. " +
      "Abandoned military atmosphere with creeping nature. " + STYLE,
  },
  {
    filename: "explore-old-armory.png",
    prompt:
      "A forgotten underground armory beneath a ruined watchtower. Stone walls lined with dusty weapon racks " +
      "and armor stands, most empty or broken. Cobwebs cover everything. A few old torches still flicker on the walls. " +
      "Crates of old supplies and rusted iron. Dark, musty, forgotten atmosphere. " + STYLE,
  },
  {
    filename: "explore-underground-passage.png",
    prompt:
      "A narrow underground stone passage beneath medieval ruins. Rough-hewn walls with support beams. " +
      "Water drips from the ceiling. Old iron brackets held torches, now only a few still burn. " +
      "Strange scratch marks on the walls. The tunnel opens into darkness ahead. " +
      "Claustrophobic, tense, deep underground atmosphere. " + STYLE,
  },

  // ── Riverbank (2 new rooms) ──
  {
    filename: "explore-misty-bend.png",
    prompt:
      "A bend in a forest river where thick mist rolls off the water. Weeping willows hang low over the banks. " +
      "Stepping stones cross the shallows. The water is darker here with an eerie green tint. " +
      "Strange ripples suggest something beneath the surface. Mysterious and misty atmosphere. " + STYLE,
  },
  {
    filename: "explore-sunken-ruins.png",
    prompt:
      "Ancient stone ruins partially submerged in a wide forest river. Crumbling pillars and arches rise from the water. " +
      "Moss and aquatic plants cover the stonework. Fish dart between the columns. " +
      "A stone platform remains above water level with old carvings still visible. " +
      "Hauntingly beautiful, ancient and waterlogged atmosphere. " + STYLE,
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
