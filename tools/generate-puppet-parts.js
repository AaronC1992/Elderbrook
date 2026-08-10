/**
 * generate-puppet-parts.js
 * Generates individual body part images for puppet animation.
 * Uses gpt-image-1 with transparent backgrounds.
 * Run: node tools/generate-puppet-parts.js
 */
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const ROOT_DIR = path.join(__dirname, "..");
const envPath = path.join(ROOT_DIR, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split(/\r?\n/).forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

const openai = new OpenAI({ apiKey: envVars.OPENAI_API_KEY });

const OUT_DIR = path.join(ROOT_DIR, "assets", "portraits", "parts", "male-player");

const CHARACTER_DESC =
  "A young male fantasy adventurer character with messy brown hair, " +
  "wearing a brown leather vest over a white lace-up shirt, " +
  "brown pants tucked into brown leather boots, " +
  "with a leather utility belt with pouches and a potion bottle. ";

const ART_STYLE =
  "Anime-influenced semi-realistic RPG character art style with bold outlines and clean shading, " +
  "painterly rendering, rich earthy brown color palette. " +
  "Illustrated character design like a JRPG sprite. NOT photorealistic. " +
  "The part should be drawn as a SINGLE ISOLATED body part on its own, " +
  "cleanly separated from other body parts with clean edges suitable for puppet animation. " +
  "No other body parts visible. No text, no UI elements.";

const parts = [
  {
    filename: "head.png",
    prompt:
      "Just the HEAD of " + CHARACTER_DESC +
      "Showing the head from the top of the messy brown hair down to the neck/collar area. " +
      "Face showing a confident adventurous expression with large anime-style grey eyes. " +
      "The neck should end with a clean edge at the base. " +
      "No shoulders, no torso, ONLY the head and neck. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "torso.png",
    prompt:
      "Just the TORSO of " + CHARACTER_DESC +
      "Showing from the shoulders (no head, no neck above collar) down to the waist/belt. " +
      "Brown leather vest over white lace-up shirt visible. Leather utility belt with pouches at the bottom. " +
      "The shoulder joints should be visible as round stubs where arms would attach. " +
      "No arms attached, no head, no legs. ONLY the torso from shoulders to belt. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "arm-right-upper.png",
    prompt:
      "Just a single RIGHT UPPER ARM piece of " + CHARACTER_DESC +
      "Showing from the shoulder joint (round top) to the elbow. " +
      "White shirt sleeve fabric visible. Drawn at a slight angle, relaxed position. " +
      "No hand, no forearm below elbow. ONLY the upper arm from shoulder to elbow. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "arm-right-lower.png",
    prompt:
      "Just a single RIGHT FOREARM AND HAND of " + CHARACTER_DESC +
      "Showing from elbow to fist. White shirt sleeve rolled up, brown leather wrist wrap, " +
      "hand in a loose fist. Drawn at a slight angle. " +
      "No upper arm above elbow. ONLY the forearm from elbow to fist. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "arm-left-upper.png",
    prompt:
      "Just a single LEFT UPPER ARM piece of " + CHARACTER_DESC +
      "Showing from the shoulder joint (round top) to the elbow. " +
      "White shirt sleeve fabric. Drawn at a slight angle, relaxed position. " +
      "This is a mirror/opposite of the right arm. " +
      "No hand, no forearm below elbow. ONLY the upper arm from shoulder to elbow. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "arm-left-lower.png",
    prompt:
      "Just a single LEFT FOREARM AND HAND of " + CHARACTER_DESC +
      "Showing from elbow to fist. White shirt sleeve rolled up, brown leather wrist wrap, " +
      "hand in a loose fist. Drawn at a slight angle. " +
      "No upper arm above elbow. ONLY the forearm from elbow to fist. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "leg-right-upper.png",
    prompt:
      "Just a single RIGHT UPPER LEG/THIGH piece of " + CHARACTER_DESC +
      "Showing from the hip joint to the knee. Brown pants fabric. " +
      "Slightly angled in a neutral standing pose. " +
      "No lower leg below knee, no torso above. ONLY the thigh from hip to knee. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "leg-right-lower.png",
    prompt:
      "Just a single RIGHT LOWER LEG AND BOOT of " + CHARACTER_DESC +
      "Showing from knee to foot. Brown pants tucked into a sturdy brown leather boot. " +
      "Slight angle in a standing pose. " +
      "No thigh above knee. ONLY the shin and boot from knee to sole. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "leg-left-upper.png",
    prompt:
      "Just a single LEFT UPPER LEG/THIGH piece of " + CHARACTER_DESC +
      "Showing from the hip joint to the knee. Brown pants fabric. " +
      "Slightly angled in a neutral standing pose. Mirror of the right leg. " +
      "No lower leg below knee, no torso above. ONLY the thigh from hip to knee. " + ART_STYLE,
    size: "1024x1024",
  },
  {
    filename: "leg-left-lower.png",
    prompt:
      "Just a single LEFT LOWER LEG AND BOOT of " + CHARACTER_DESC +
      "Showing from knee to foot. Brown pants tucked into a sturdy brown leather boot. " +
      "Slight angle in a standing pose. Mirror of the right leg. " +
      "No thigh above knee. ONLY the shin and boot from knee to sole. " + ART_STYLE,
    size: "1024x1024",
  },
];

async function generate() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating ${parts.length} puppet parts for male-player...\n`);

  for (const part of parts) {
    const outPath = path.join(OUT_DIR, part.filename);

    if (fs.existsSync(outPath)) {
      console.log(`  SKIP  ${part.filename} (already exists)`);
      continue;
    }

    console.log(`  GEN   ${part.filename} ...`);
    try {
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: part.prompt,
        n: 1,
        size: part.size,
        background: "transparent",
        output_format: "png",
      });

      const base64Data = response.data[0].b64_json;
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(outPath, buffer);
      console.log(`  SAVED ${part.filename}`);
    } catch (err) {
      console.error(`  FAIL  ${part.filename}: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

generate();
