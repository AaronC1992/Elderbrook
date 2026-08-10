/**
 * regenerate-whisper.js
 * Re-generates whisper.png with DALL-E — single full-body figure, transparent bg.
 * Run: node tools/regenerate-whisper.js
 */
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

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
  "Fantasy digital painting, gritty semi-realistic RPG art style, " +
  "painterly rendering, rich earthy color palette, no text, no UI elements.";

const prompt =
  "A single standing figure of a female half-elf assassin mentor named Whisper. " +
  "She has short silver-white hair, pointed ears, and piercing violet eyes with a cold, calculating gaze. " +
  "She wears form-fitting black leather armor with dark metal buckles and a utility belt holding vials and daggers. " +
  "Black gloves, dark boots, a hooded dark cloak draped over her shoulders. " +
  "Arms crossed or one hand resting on a concealed blade. Slim athletic build, confident and deadly stance. " +
  "Show her complete body from the top of her head down to her boots. " +
  "Only one single character in the image, centered in frame. No concept art, no multiple views, no reference sheet. " +
  STYLE;

async function generate() {
  const outPath = path.join(OUT_DIR, "whisper.png");
  const backupPath = path.join(OUT_DIR, "whisper_old.png");

  // Backup existing
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, backupPath);
    fs.unlinkSync(outPath);
    console.log("  Backed up existing whisper.png -> whisper_old.png");
  }

  console.log("  GEN   whisper.png ...");
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1536",
      background: "transparent",
      output_format: "png",
    });

    const base64Data = response.data[0].b64_json;
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(outPath, buffer);
    console.log("  SAVED whisper.png");
  } catch (err) {
    console.error(`  FAIL  whisper.png: ${err.message}`);
    // Restore backup on failure
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, outPath);
      console.log("  Restored backup.");
    }
  }

  console.log("\nDone!");
}

generate();
