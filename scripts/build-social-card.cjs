const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const coverPath = path.join(root, "founding-families", "assets", "first-numbers-scenic.png");
const outputPath = path.join(root, "founding-families", "assets", "social-first-numbers.png");
const cover = fs.readFileSync(coverPath).toString("base64");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f2e8"/>
  <rect x="0" y="0" width="18" height="630" fill="#6f765e"/>
  <text x="78" y="76" fill="#97742f" font-family="Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="4">A NORDIC CHILDHOOD</text>
  <text x="78" y="155" fill="#4a321c" font-family="Georgia, serif" font-size="61">
    <tspan x="78" dy="0">Help counting words</tspan>
    <tspan x="78" dy="72">become real amounts.</tspan>
  </text>
  <text x="78" y="345" fill="#6b4f35" font-family="Arial, sans-serif" font-size="25">
    <tspan x="78" dy="0">A free 19-page First Numbers pilot</tspan>
    <tspan x="78" dy="38">for one honest family attempt.</tspan>
  </text>
  <rect x="78" y="472" width="342" height="62" rx="7" fill="#6f765e"/>
  <text x="249" y="511" text-anchor="middle" fill="#f7f2e8" font-family="Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="1.5">SEE IF THIS FITS YOUR CHILD</text>
  <rect x="835" y="54" width="286" height="522" rx="5" fill="#e8ddc9"/>
  <image href="data:image/png;base64,${cover}" x="850" y="34" width="252" height="562" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

sharp(Buffer.from(svg)).png().toFile(outputPath);
