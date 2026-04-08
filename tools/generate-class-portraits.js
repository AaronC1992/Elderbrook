/**
 * generate-class-portraits.js
 * Uses OpenAI DALL-E 3 to generate class portraits for Elderbrook.
 * Run: node tools/generate-class-portraits.js
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
const OUT_DIR = path.join(__dirname, "..", "assets", "portraits");

const STYLE =
  "Fantasy digital painting, detailed full-body character portrait, " +
  "gritty semi-realistic RPG art style, no background, transparent background, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const portraits = [
  // Knight
  {
    filename: "male_player_knight.png",
    prompt:
      "A young male medieval knight in full plate armor with a blue-and-silver surcoat. " +
      "Carries a longsword and a large kite shield with a crest. Clean-shaven with short brown hair, " +
      "determined expression. Noble posture, standing at attention. " + STYLE,
  },
  {
    filename: "female_player_knight.png",
    prompt:
      "A young female medieval knight in polished plate armor with a blue-and-silver surcoat. " +
      "Carries a longsword and a large kite shield with a crest. Hair tied back in a practical braid, " +
      "determined expression. Noble upright posture. " + STYLE,
  },
  // Berserker
  {
    filename: "male_player_berserker.png",
    prompt:
      "A muscular male berserker warrior with wild unkempt hair and war paint on his face. " +
      "Wearing minimal leather armor and fur pelts, showing battle scars across arms and chest. " +
      "Wielding a massive two-handed greataxe. Fierce snarling expression, veins bulging. " +
      "Wild and savage appearance. " + STYLE,
  },
  {
    filename: "female_player_berserker.png",
    prompt:
      "A fierce muscular female berserker warrior with wild braided hair and tribal war paint. " +
      "Wearing minimal leather armor and fur pelts, showing battle scars on her arms. " +
      "Wielding a massive two-handed greataxe. Intense snarling expression, raw fury in her eyes. " + STYLE,
  },
  // Assassin
  {
    filename: "male_player_assassin.png",
    prompt:
      "A lean male assassin in dark fitted leather armor with a deep hood partially shadowing his face. " +
      "Twin daggers strapped to his belt, throwing knives on a chest bandolier. " +
      "Sharp calculating eyes, angular features. Poised and ready to strike. " +
      "Dark color scheme with subtle dark red accents. " + STYLE,
  },
  {
    filename: "female_player_assassin.png",
    prompt:
      "A lean female assassin in dark fitted leather armor with a deep hood partially shadowing her face. " +
      "Twin daggers strapped to her belt, throwing knives on a chest bandolier. " +
      "Sharp calculating eyes, angular features. Poised and catlike stance. " +
      "Dark color scheme with subtle dark red accents. " + STYLE,
  },
  // Pyromancer
  {
    filename: "male_player_pyromancer.png",
    prompt:
      "A young male pyromancer mage in flowing dark red and black robes with flame motifs embroidered in gold. " +
      "One hand wreathed in magical fire, the other holding a charred black staff topped with a glowing ember. " +
      "Messy dark hair with an intense focused gaze. Scorch marks on the hem of his robes. " + STYLE,
  },
  {
    filename: "female_player_pyromancer.png",
    prompt:
      "A young female pyromancer mage in flowing dark red and black robes with flame motifs embroidered in gold. " +
      "One hand wreathed in magical fire, the other holding a charred black staff topped with a glowing ember. " +
      "Long dark hair flowing freely, intense focused gaze. Scorch marks on the hem of her robes. " + STYLE,
  },
  // Cleric
  {
    filename: "male_player_cleric.png",
    prompt:
      "A young male cleric healer in white and gold priestly robes with a holy symbol pendant around his neck. " +
      "Carrying a staff topped with a glowing crystal that emits soft golden light. " +
      "Gentle compassionate expression, short light hair. Clean and serene appearance. " +
      "Light emanating softly from his hands. " + STYLE,
  },
  {
    filename: "female_player_cleric.png",
    prompt:
      "A young female cleric healer in white and gold priestly robes with a holy symbol pendant around her neck. " +
      "Carrying a staff topped with a glowing crystal that emits soft golden light. " +
      "Gentle compassionate expression, long light hair. Clean and serene appearance. " +
      "Light emanating softly from her hands. " + STYLE,
  },
  // Paladin
  {
    filename: "male_player_paladin.png",
    prompt:
      "A powerful male paladin holy warrior in gleaming white-and-gold heavy plate armor with a tabard " +
      "bearing a radiant sun emblem. Wielding a glowing warhammer in one hand and a golden shield in the other. " +
      "Strong jaw, short blond hair, righteous determined expression. A faint divine glow around him. " + STYLE,
  },
  {
    filename: "female_player_paladin.png",
    prompt:
      "A powerful female paladin holy warrior in gleaming white-and-gold heavy plate armor with a tabard " +
      "bearing a radiant sun emblem. Wielding a glowing warhammer in one hand and a golden shield in the other. " +
      "Strong features, hair pulled back in a warrior braid, righteous determined expression. " +
      "A faint divine glow around her. " + STYLE,
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
  console.log(`Generating ${portraits.length} class portraits with DALL-E 3...\n`);

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
