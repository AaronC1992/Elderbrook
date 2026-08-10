/**
 * generate-mentor-portraits.js
 * Uses OpenAI DALL-E 3 to generate class mentor NPC portraits.
 * Run: node tools/generate-mentor-portraits.js
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
  {
    filename: "varn.png",
    prompt:
      "A grizzled veteran warrior in his 50s named Varn. Heavily scarred face with a permanent scowl, " +
      "short-cropped grey hair, thick neck and broad shoulders. Wearing battered iron plate armor with " +
      "dents and scratches from decades of combat. A heavy longsword strapped across his back. " +
      "Military bearing, arms crossed, radiating toughness and discipline. " + STYLE,
  },
  {
    filename: "shade.png",
    prompt:
      "A lithe hooded rogue named Shade, gender ambiguous, leaning casually against nothing. " +
      "Wearing dark leather armor under a deep charcoal cloak with the hood partially shadowing the face. " +
      "Visible sharp features, a knowing smirk, and clever dark eyes. Twin daggers on the belt. " +
      "Bandaged hands, a faint scar across the bridge of the nose. Exudes quiet confidence and cunning. " + STYLE,
  },
  {
    filename: "theron.png",
    prompt:
      "An elderly sage mage named Theron, around 70 years old. Long white beard, kind but sharp blue eyes " +
      "behind small round spectacles. Wearing deep blue and silver robes with arcane symbols embroidered " +
      "along the hems. Carrying a gnarled wooden staff topped with a softly glowing crystal. " +
      "A satchel of scrolls and herbs at his side. Scholarly and slightly absent-minded look. " + STYLE,
  },
  {
    filename: "lysara.png",
    prompt:
      "A noble female knight named Dame Lysara in her 30s. Tall and strong with auburn hair in a practical braid. " +
      "Wearing polished silver-white plate armor with a blue tabard bearing a shield emblem. " +
      "A bastard sword at her hip and a kite shield on her back. Proud posture, stern but fair expression, " +
      "a thin scar on her left cheek. Radiates honor and duty. " + STYLE,
  },
  {
    filename: "grul.png",
    prompt:
      "A massive wild berserker named Grul, half-orc with grey-green skin and prominent tusks. " +
      "Towering muscular build, wild black hair with bone ornaments braided in. " +
      "Wearing crude fur and leather armor leaving arms bare, showing tribal tattoos and battle scars. " +
      "Carrying a massive two-handed battle axe. Fierce amber eyes, an almost feral grin. " +
      "Raw power and barely restrained rage. " + STYLE,
  },
  {
    filename: "whisper.png",
    prompt:
      "A shadowy assassin named Whisper, a slender elven woman with pale skin and silver-white hair. " +
      "Wearing form-fitting dark leather armor with a high collar and a dark half-mask covering the lower face. " +
      "Pale violet eyes that seem to look through you. Multiple hidden blades visible at wrists and boots. " +
      "Standing in a relaxed but ready-to-strike pose. Silent, deadly, unreadable expression. " + STYLE,
  },
  {
    filename: "fenn.png",
    prompt:
      "A weathered forest ranger named Warden Fenn, a rugged man in his 40s with sun-darkened skin " +
      "and medium-length brown hair with streaks of grey. Wearing practical green and brown leather armor " +
      "with a forest cloak. A longbow across his back and a hunting knife at his belt. " +
      "A hawk perched on his shoulder. Calm watchful eyes, crow's feet from years of squinting. " +
      "A quiet protector of the wilds. " + STYLE,
  },
  {
    filename: "cindra.png",
    prompt:
      "A fiery pyromancer named Cindra, a young woman in her mid-20s with wild crimson-red hair " +
      "that seems to flicker like flame at the tips. Wearing dark red and black robes with ember-like " +
      "patterns. One hand casually holds a small dancing flame. Amber eyes with an intense passionate gaze. " +
      "Slight burn scars on her hands from years of fire magic. Confident stance, a daring half-smile. " + STYLE,
  },
  {
    filename: "maren.png",
    prompt:
      "A gentle priestess healer named Sister Maren, a middle-aged woman with warm brown skin " +
      "and kind dark eyes. Wearing simple white and gold clerical robes with a sun pendant at her throat. " +
      "Dark hair in a neat bun with a white headband. Hands clasped serenely, a soft warm glow around her palms. " +
      "Radiates compassion and quiet inner strength. Gentle smile lines around her eyes. " + STYLE,
  },
  {
    filename: "cedric.png",
    prompt:
      "A holy paladin named Sir Cedric, a tall imposing man in his late 30s with a square jaw " +
      "and short blond hair. Wearing gleaming golden-trimmed white plate armor with sacred engravings. " +
      "A massive two-handed warhammer resting on his shoulder. A golden holy symbol hangs from his neck. " +
      "Serious righteous expression, piercing blue eyes. Scars visible on his hands from years of battle " +
      "against darkness. An aura of divine authority. " + STYLE,
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
  console.log(`Generating ${portraits.length} class mentor portraits with DALL-E 3...\n`);

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
