/**
 * generate-festival-backgrounds.js
 * Uses OpenAI DALL-E 3 to generate festival versions of shop/location interiors.
 * Run: node tools/generate-festival-backgrounds.js
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

const FESTIVAL_DECO =
  "decorated for a harvest festival with colorful bunting, autumn garlands, " +
  "warm lanterns, scattered autumn leaves, flower arrangements, and festive ribbons. ";

const backgrounds = [
  {
    filename: "main-town-inn-festival.png",
    prompt:
      "Interior of a cozy medieval fantasy tavern inn " + FESTIVAL_DECO +
      "Wooden beams hung with harvest wreaths and string lanterns, barrels of cider stacked behind the bar, " +
      "a roaring fireplace with autumn decorations on the mantle, tables set with festive food and mugs of cider, " +
      "warm golden candlelight throughout. The atmosphere is celebratory and packed. " + STYLE,
  },
  {
    filename: "main-town-weapons-shop-festival.png",
    prompt:
      "Interior of a medieval fantasy blacksmith weapon shop " + FESTIVAL_DECO +
      "The forge glows warmly, weapons displayed on walls draped with harvest garlands, " +
      "commemorative blades on a special display table with autumn leaves and ribbons, " +
      "bunting strung across the rafters, a barrel of cider in the corner. " +
      "Warm forge-light mixed with festive lantern glow. " + STYLE,
  },
  {
    filename: "main-town-armor-shop-festival.png",
    prompt:
      "Interior of a medieval fantasy armory shop " + FESTIVAL_DECO +
      "Armor stands and racks draped with autumn-colored ribbons, harvest wreaths on the walls, " +
      "warm lanterns hanging from the ceiling beams, a small festive display near the counter, " +
      "the usually stern shop has a surprisingly warm and festive atmosphere. " + STYLE,
  },
  {
    filename: "main-town-potions-shop-festival.png",
    prompt:
      "Interior of a cozy medieval fantasy alchemy potion shop " + FESTIVAL_DECO +
      "Shelves of colorful potions and bottles with harvest garlands woven between them, " +
      "a bubbling cauldron of festive cider in the center, dried autumn herbs hanging from the ceiling, " +
      "warm amber lanterns, pumpkins and autumn flowers on the counters. " +
      "A magical festive atmosphere with potion bottles glowing warmly. " + STYLE,
  },
  {
    filename: "main-town-adventurers-guild-festival.png",
    prompt:
      "Interior of a medieval fantasy adventurers guild hall " + FESTIVAL_DECO +
      "Long wooden tables set with festive mugs and platters of food, " +
      "the quest board decorated with harvest wreaths, colorful banners hanging from the rafters, " +
      "a large barrel of cider near the entrance, warm firelight and festive lanterns, " +
      "the atmosphere of a celebration among warriors and adventurers. " + STYLE,
  },
  {
    filename: "main-town-pet-shop-festival.png",
    prompt:
      "Interior of a charming medieval fantasy pet emporium " + FESTIVAL_DECO +
      "Animal cages and enclosures decorated with autumn ribbons and small wreaths, " +
      "warm lanterns casting a cozy glow, scattered autumn leaves and flowers, " +
      "small pumpkins near the animal pens, the shop has a warm festive feel " +
      "while still being a place full of magical and mundane creatures. " + STYLE,
  },
  {
    filename: "guard-post-festival.png",
    prompt:
      "Interior of a medieval fantasy guard post and barracks " + FESTIVAL_DECO +
      "Weapon racks and duty boards draped with modest harvest decorations, " +
      "a few lanterns and a small wreath on the door, soldiers' quarters tidied up for the occasion, " +
      "a barrel of cider in the corner that someone clearly smuggled in. " +
      "Less decorated than the shops but with small festive touches showing even guards celebrate. " + STYLE,
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
  console.log(`Generating ${backgrounds.length} festival backgrounds with DALL-E 3...\n`);

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
