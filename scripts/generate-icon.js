#!/usr/bin/env node
/**
 * Generates images/icon.png (128x128) for the marketplace.
 * Fun side-view brain: profile silhouette with bumpy cortex.
 * Run: node scripts/generate-icon.js
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const size = 128;
const png = new PNG({ width: size, height: size });

const bg = { r: 28, g: 30, b: 38, a: 255 };
const brain = { r: 147, g: 112, b: 219, a: 255 }; // medium purple — memory/thought

function setPixel(x, y, c) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (size * y + x) << 2;
  png.data[i] = c.r;
  png.data[i + 1] = c.g;
  png.data[i + 2] = c.b;
  png.data[i + 3] = c.a;
}

// Inside ellipse at (cx, cy) with radii rx, ry
function inEllipse(px, py, cx, cy, rx, ry) {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

// Fun side-view brain: main blob + cortex bumps (profile view)
function inBrain(px, py) {
  const main = inEllipse(px, py, 64, 58, 44, 40);   // main mass (horizontal oval)
  const front = inEllipse(px, py, 26, 54, 16, 22);   // frontal lobe bump
  const top1 = inEllipse(px, py, 50, 34, 20, 16);    // top cortex bump
  const top2 = inEllipse(px, py, 78, 30, 22, 18);   // top cortex bump
  const back = inEllipse(px, py, 100, 50, 16, 24);  // back/cerebellum bump
  return main || front || top1 || top2 || back;
}

// Background
for (let i = 0; i < png.data.length; i += 4) {
  png.data[i] = bg.r;
  png.data[i + 1] = bg.g;
  png.data[i + 2] = bg.b;
  png.data[i + 3] = bg.a;
}

// Draw brain
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (inBrain(x, y)) setPixel(x, y, brain);
  }
}

const outDir = path.join(__dirname, "..", "images");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "icon.png");
const stream = fs.createWriteStream(outPath);
png.pack().pipe(stream);
stream.on("finish", () => console.log("Written", outPath));
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
