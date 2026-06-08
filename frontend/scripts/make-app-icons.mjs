// Generates source app icon + splash images (the MANIT crest on navy) into
// assets/, which `@capacitor/assets generate` turns into Android resources.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const NAVY = { r: 21, g: 43, b: 76, alpha: 1 }; // #152b4c

const crest = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="n" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a66ae"/>
      <stop offset="1" stop-color="#142b4c"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#n)"/>
  <circle cx="24" cy="24" r="22" fill="none" stroke="#bd8a1e" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="18" fill="none" stroke="#e0ba4f" stroke-width="0.6" opacity="0.55"/>
  <polygon points="12,18.5 23,16.5 23,31.6 12,33.1" fill="#ffffff"/>
  <polygon points="36,18.5 25,16.5 25,31.6 36,33.1" fill="#ffffff"/>
  <g stroke="#1e4f92" stroke-width="0.8" opacity="0.5" stroke-linecap="round">
    <line x1="14.6" y1="21" x2="21" y2="19.9"/>
    <line x1="14.6" y1="24" x2="21" y2="22.9"/>
    <line x1="14.6" y1="27" x2="21" y2="25.9"/>
    <line x1="27" y1="19.9" x2="33.4" y2="21"/>
    <line x1="27" y1="22.9" x2="33.4" y2="24"/>
    <line x1="27" y1="25.9" x2="33.4" y2="27"/>
  </g>
  <rect x="23" y="16.2" width="2" height="15.6" fill="#142b4c"/>
  <path d="M24 7.4l1.15 2.55 2.55 1.15-2.55 1.15L24 14.8l-1.15-2.55-2.55-1.15 2.55-1.15z" fill="#e0ba4f"/>
</svg>`;

const crestPng = (size) =>
  sharp(Buffer.from(crest)).resize(size, size).png().toBuffer();

await mkdir("assets", { recursive: true });

// Adaptive icon foreground (crest inside the safe zone, transparent bg)
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: await crestPng(620), gravity: "center" }])
  .png()
  .toFile("assets/icon-foreground.png");

// Adaptive icon background (solid navy)
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: NAVY } })
  .png()
  .toFile("assets/icon-background.png");

// Legacy / full icon (crest on navy)
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: NAVY } })
  .composite([{ input: await crestPng(760), gravity: "center" }])
  .png()
  .toFile("assets/icon.png");

// Splash screens (light + dark) — crest centered on navy
for (const name of ["splash.png", "splash-dark.png"]) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: NAVY } })
    .composite([{ input: await crestPng(720), gravity: "center" }])
    .png()
    .toFile(`assets/${name}`);
}

console.log("✓ Generated source app assets in assets/");
