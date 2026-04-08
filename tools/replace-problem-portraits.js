const fs = require("fs");
const path = require("path");
const https = require("https");
const { OpenAI } = require("openai");

const ROOT_DIR = path.join(__dirname, "..");
const PORTRAIT_DIR = path.join(ROOT_DIR, "assets", "portraits");
const BACKUP_DIR = path.join(ROOT_DIR, "assets", "_originals", "portraits");

const envPath = path.join(ROOT_DIR, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const HUMAN_STYLE =
  "Fantasy digital painting, detailed full-body character portrait, gritty semi-realistic RPG art style, " +
  "single subject only, exactly one character only, no duplicate figures, no split composition, no inset image, no collage, " +
  "no crowd, no companion, no background, transparent background, painterly rendering, rich earthy color palette, no text, no UI elements.";

const ANIMAL_STYLE =
  "Fantasy digital painting, detailed character portrait, gritty semi-realistic RPG art style, " +
  "single subject only, exactly one animal only, no duplicate figures, no split composition, no inset image, no collage, " +
  "no handler, no rider, no background, transparent background, painterly rendering, rich earthy color palette, no text, no UI elements.";

const targets = [
  {
    filename: "cedric.png",
    prompt:
      "A holy paladin named Sir Cedric, a tall imposing man in his late 30s with a square jaw and short blond hair. " +
      "Wearing gleaming golden-trimmed white plate armor with sacred engravings. A massive two-handed warhammer resting on his shoulder. " +
      "A golden holy symbol hangs from his neck. Serious righteous expression, piercing blue eyes, scars visible on his hands from years of battle against darkness. " +
      "An aura of divine authority. " + HUMAN_STYLE,
  },
  {
    filename: "cindra.png",
    prompt:
      "A fiery pyromancer named Cindra, a young woman in her mid-20s with wild crimson-red hair that seems to flicker like flame at the tips. " +
      "Wearing dark red and black robes with ember-like patterns. One hand casually holds a small dancing flame. Amber eyes with an intense passionate gaze. " +
      "Slight burn scars on her hands from years of fire magic. Confident stance, a daring half-smile. " + HUMAN_STYLE,
  },
  {
    filename: "fenn.png",
    prompt:
      "A weathered forest ranger named Warden Fenn, a rugged man in his 40s with sun-darkened skin and medium-length brown hair with streaks of grey. " +
      "Wearing practical green and brown leather armor with a forest cloak. A longbow across his back and a hunting knife at his belt. " +
      "A hawk perched on his shoulder, calm watchful eyes, crow's feet from years of squinting. A quiet protector of the wilds. " + HUMAN_STYLE,
  },
  {
    filename: "grul.png",
    prompt:
      "A massive wild berserker named Grul, a half-orc with grey-green skin and prominent tusks. Towering muscular build, wild black hair with bone ornaments braided in. " +
      "Wearing crude fur and leather armor leaving his arms bare, showing tribal tattoos and battle scars. Carrying a massive two-handed battle axe. " +
      "Fierce amber eyes and an almost feral grin. Raw power and barely restrained rage. " + HUMAN_STYLE,
  },
  {
    filename: "lysara.png",
    prompt:
      "A noble female knight named Dame Lysara in her 30s. Tall and strong with auburn hair in a practical braid. Wearing polished silver-white plate armor with a blue tabard bearing a shield emblem. " +
      "A bastard sword at her hip and a kite shield on her back. Proud posture, stern but fair expression, a thin scar on her left cheek. Radiates honor and duty. " + HUMAN_STYLE,
  },
  {
    filename: "maren.png",
    prompt:
      "A gentle priestess healer named Sister Maren, a middle-aged woman with warm brown skin and kind dark eyes. Wearing simple white and gold clerical robes with a sun pendant at her throat. " +
      "Dark hair in a neat bun with a white headband. Hands clasped serenely, a soft warm glow around her palms. Radiates compassion and quiet inner strength. " + HUMAN_STYLE,
  },
  {
    filename: "theron.png",
    prompt:
      "An elderly sage mage named Theron, around 70 years old, with a long white beard and kind but sharp blue eyes behind small round spectacles. " +
      "Wearing deep blue and silver robes with arcane symbols embroidered along the hems. Carrying a gnarled wooden staff topped with a softly glowing crystal. " +
      "A satchel of scrolls and herbs hangs at his side. Scholarly and slightly absent-minded, but powerful. " + HUMAN_STYLE,
  },
  {
    filename: "varn.png",
    prompt:
      "A grizzled veteran warrior in his 50s named Varn. Heavily scarred face with a permanent scowl, short-cropped grey hair, thick neck, and broad shoulders. " +
      "Wearing battered iron plate armor with dents and scratches from decades of combat. A heavy longsword strapped across his back. " +
      "Military bearing, arms crossed, radiating toughness and discipline. " + HUMAN_STYLE,
  },
  {
    filename: "whisper.png",
    prompt:
      "A shadowy elven infiltrator named Whisper, a slender woman with pale skin and silver-white hair. Wearing elegant dark leather armor with a high collar and a dark half-mask covering the lower face. " +
      "Pale violet eyes that seem to look through you. Subtle utility sheaths at wrists and boots. Standing in a calm poised stance. " +
      "Silent, mysterious, unreadable expression. " + HUMAN_STYLE,
  },
  {
    filename: "main-town-guildmaster-npc.png",
    prompt:
      "A seasoned guildmaster named Rowan, a rugged middle-aged man with short brown hair streaked with grey and a neatly kept beard. " +
      "Wearing practical brown leather adventurer's gear upgraded for a town official, with a dark cloak and a small silver guild insignia clasp. " +
      "Carrying a rolled map case at his belt and radiating calm authority, competence, and warmth. " + HUMAN_STYLE,
  },
  {
    filename: "female_player_assassin.png",
    prompt:
      "A lean female stealth rogue in dark fitted leather armor with a deep hood partially shadowing her face. Slim short blades hang at her belt, with subtle utility gear across her chest. " +
      "Sharp calculating eyes, angular features, and a poised catlike stance. Dark color scheme with subtle dark red accents. " + HUMAN_STYLE,
  },
  {
    filename: "female_player_berserker.png",
    prompt:
      "A fierce muscular female berserker warrior with wild braided hair and tribal war paint. Wearing minimal leather armor and fur pelts, showing battle scars on her arms. " +
      "Wielding a massive two-handed greataxe. Intense snarling expression, raw fury in her eyes. " + HUMAN_STYLE,
  },
  {
    filename: "female_player_cleric.png",
    prompt:
      "A young female cleric healer in white and gold priestly robes with a holy symbol pendant around her neck. Carrying a staff topped with a glowing crystal that emits soft golden light. " +
      "Gentle compassionate expression, long light hair, serene appearance, and light emanating softly from her hands. " + HUMAN_STYLE,
  },
  {
    filename: "female_player_knight.png",
    prompt:
      "A young female medieval knight in polished plate armor with a blue-and-silver surcoat. Carries a longsword and a large kite shield with a crest. " +
      "Hair tied back in a practical braid, determined expression, noble upright posture. " + HUMAN_STYLE,
  },
  {
    filename: "female_player_paladin.png",
    prompt:
      "A powerful female paladin holy warrior in gleaming white-and-gold heavy plate armor with a tabard bearing a radiant sun emblem. " +
      "Wielding a glowing warhammer in one hand and a golden shield in the other. Strong features, hair pulled back in a warrior braid, righteous determined expression, and a faint divine glow around her. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_assassin.png",
    prompt:
      "A lean male stealth rogue in dark fitted leather armor with a deep hood partially shadowing his face. Slim short blades hang at his belt, with subtle utility gear across his chest. " +
      "Sharp calculating eyes, angular features, and a poised athletic stance. Dark color scheme with subtle dark red accents. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_berserker.png",
    prompt:
      "A muscular male berserker warrior with wild unkempt hair and war paint on his face. Wearing minimal leather armor and fur pelts, showing battle scars across arms and chest. " +
      "Wielding a massive two-handed greataxe. Fierce snarling expression, veins bulging, wild and savage appearance. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_cleric.png",
    prompt:
      "A young male cleric healer in white and gold priestly robes with a holy symbol pendant around his neck. Carrying a staff topped with a glowing crystal that emits soft golden light. " +
      "Gentle compassionate expression, short light hair, serene appearance, and light emanating softly from his hands. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_knight.png",
    prompt:
      "A young male medieval knight in full plate armor with a blue-and-silver surcoat. Carries a longsword and a large kite shield with a crest. " +
      "Clean-shaven with short brown hair, determined expression, noble posture, standing at attention. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_paladin.png",
    prompt:
      "A powerful male paladin holy warrior in gleaming white-and-gold heavy plate armor with a tabard bearing a radiant sun emblem. " +
      "Wielding a glowing warhammer in one hand and a golden shield in the other. Strong jaw, short blond hair, righteous determined expression, and a faint divine glow around him. " + HUMAN_STYLE,
  },
  {
    filename: "male_player_pyromancer.png",
    prompt:
      "A young male pyromancer mage in flowing dark red and black robes with flame motifs embroidered in gold. One hand wreathed in magical fire, the other holding a charred black staff topped with a glowing ember. " +
      "Messy dark hair, intense focused gaze, and scorch marks on the hem of his robes. " + HUMAN_STYLE,
  },
  {
    filename: "pet-barn-owl.png",
    prompt:
      "A beautiful barn owl perched and ready, with golden-brown speckled feathers and a white heart-shaped face. Large dark intelligent eyes and talons gripping a small leather falconer's perch strap. " +
      "A wise magical companion animal. " + ANIMAL_STYLE,
  },
  {
    filename: "pet-ferret.png",
    prompt:
      "A sleek dark-furred ferret with bright beady eyes and a mischievous expression. Long sinuous body, tiny paws, and a miniature leather harness. " +
      "A thief's best friend, quick and sneaky. " + ANIMAL_STYLE,
  },
  {
    filename: "pet-fox-kit.png",
    prompt:
      "An adorable young red fox kit with bright orange-red fur, a white-tipped bushy tail, and big curious dark eyes. Wearing a tiny green bandana around its neck. " +
      "Playful and quick, an agile scout companion. " + ANIMAL_STYLE,
  },
  {
    filename: "pet-shop-keeper.png",
    prompt:
      "A kind elderly woman running a fantasy pet shop. Wild curly grey hair with feathers and small flowers woven in. Weathered but warm face with bright hazel eyes and deep laugh lines. " +
      "Wearing a patched leather apron with various pouches and radiating gentle earth-mother energy, clearly beloved by animals. " + HUMAN_STYLE,
  },
  {
    filename: "pet-tabby-cat.png",
    prompt:
      "A scrappy orange tabby cat sitting with a confident swagger, bright green eyes, and a notched ear from old scraps. Wearing a tiny leather collar with a copper bell. " +
      "Street-smart and loyal, a charming rogue's companion. " + ANIMAL_STYLE,
  },
  {
    filename: "pet-timber-wolf.png",
    prompt:
      "A loyal young timber wolf companion sitting obediently, medium-sized with thick grey-brown fur, alert amber eyes, and a leather collar with a small iron tag. " +
      "Friendly but fierce, ears perked up, a trusty adventuring companion. " + ANIMAL_STYLE,
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function backupOriginal(filePath, filename) {
  if (!fs.existsSync(filePath)) return;
  const backupPath = path.join(BACKUP_DIR, filename);
  ensureDir(path.dirname(backupPath));
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        }).on("error", reject);
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function getSelectedTargets() {
  const onlyArgs = process.argv.slice(2);
  if (!onlyArgs.length) return targets;

  const wanted = new Set(onlyArgs.map((arg) => arg.toLowerCase()));
  return targets.filter((target) => wanted.has(target.filename.toLowerCase()));
}

async function generateTarget(target) {
  const outPath = path.join(PORTRAIT_DIR, target.filename);
  const tempPath = outPath + ".tmp";

  backupOriginal(outPath, target.filename);

  console.log("GEN  " + target.filename);
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: target.prompt,
    n: 1,
    size: target.size || "1024x1792",
    quality: "standard",
  });

  const imageUrl = response.data[0].url;
  await downloadImage(imageUrl, tempPath);
  fs.renameSync(tempPath, outPath);
  console.log("SAVE " + target.filename);
}

async function main() {
  ensureDir(BACKUP_DIR);
  const selectedTargets = getSelectedTargets();

  if (!selectedTargets.length) {
    console.log("No matching targets selected.");
    process.exit(0);
  }

  console.log("Replacing " + selectedTargets.length + " portrait(s)...\n");
  for (const target of selectedTargets) {
    try {
      await generateTarget(target);
    } catch (error) {
      console.error("FAIL " + target.filename + ": " + error.message);
    }
  }

  console.log("\nDone.");
}

main();