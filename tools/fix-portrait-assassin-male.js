/**
 * fix-portrait-assassin-male.js
 * Regenerates male_player_assassin.png with proper: transparent BG, full body, single character.
 * Run: node tools/fix-portrait-assassin-male.js
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
const outPath = path.join(__dirname, "..", "assets", "portraits", "male_player_assassin.png");

const prompt =
  "Portrait of exactly one young man standing alone. He is a fantasy shadow scout wearing dark leather armor " +
  "with a hood over his head, brown and black color scheme with dark red accents. He has a bandolier with pouches " +
  "across his chest. Sharp eyes, angular jawline. He stands alone with nothing else in the scene. " +
  "Show his entire body from the top of his hood down to his leather boots at the very bottom of the frame. " +
  "There is absolutely no one else in this image. No other people. No background scenery. " +
  "Transparent background. Fantasy RPG digital painting, semi-realistic, detailed, painterly, no text.";

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          https
            .get(response.headers.location, (redirectedResponse) => {
              redirectedResponse.pipe(file);
              file.on("finish", () => { file.close(); resolve(); });
            })
            .on("error", reject);
          return;
        }
        response.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function generate() {
  console.log("Regenerating male_player_assassin.png ...");

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1792",
    quality: "standard",
  });

  await downloadImage(response.data[0].url, outPath);
  console.log(`Saved portrait to ${outPath}`);
}

generate().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
