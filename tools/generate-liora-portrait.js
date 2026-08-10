/**
 * generate-liora-portrait.js
 * Uses OpenAI DALL-E 3 to generate Liora Bloom's portrait.
 * Run: node tools/generate-liora-portrait.js
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
const outPath = path.join(__dirname, "..", "assets", "portraits", "liora.png");

const prompt =
  "A beautiful young florist named Liora Bloom in a fantasy village. SINGLE CHARACTER ONLY. " +
  "Elegant woman in her mid-20s with warm ivory skin, long chestnut-brown hair woven with tiny wildflowers, " +
  "soft green eyes, and a gentle but playful smile. Wearing a refined cottagecore-inspired dress in cream, sage, " +
  "and blush tones with an apron sash and delicate floral embroidery. Holding a bouquet of freshly cut wildflowers " +
  "and herbs, with a light romantic fantasy aesthetic. One woman only, centered in frame, no duplicate figures, no mirrored figure, " +
  "no side-by-side composition, no extra bodies, no secondary pose sheet. Full-body character portrait, semi-realistic painterly RPG art, " +
  "detailed clothing, graceful posture, no background, transparent background, no text, no UI elements.";

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          https
            .get(response.headers.location, (redirectedResponse) => {
              redirectedResponse.pipe(file);
              file.on("finish", () => {
                file.close();
                resolve();
              });
            })
            .on("error", reject);
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function generate() {
  console.log("Generating Liora Bloom portrait...");

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