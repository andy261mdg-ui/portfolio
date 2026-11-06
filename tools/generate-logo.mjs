// Génère les icônes du monogramme « AR » à partir d'une source unique.
//
// Le badge de référence est celui de l'en-tête (.brand-mark dans css/style.css) :
// carré 38 px, border-radius 10 px, fond #2563eb, « AR » en Inter 800 avec
// letter-spacing 0,5 px. Ce script redessine exactement le même badge et le rend
// via Chrome (Playwright, déjà une dépendance de tests) pour produire :
//
//   assets/favicon-16.png          onglet 16 px  (coins arrondis, fond transparent)
//   assets/favicon-32.png          onglet 32 px  (idem)
//   assets/apple-touch-icon.png    écran d'accueil iOS 180×180, CARRÉ PLEIN
//                                  (iOS applique lui-même son masque d'arrondi :
//                                  un badge déjà arrondi donnerait un carré flottant)
//
// PNG rendu par Chrome avec Inter → identique au pixel près à l'en-tête, contraire-
// ment à l'ancien favicon SVG (<text> en Arial, polices locales) et à l'ancienne
// icône Apple (police système via Pillow).
//
// Utilisation : npm run logo   (ou : node tools/generate-logo.mjs)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FONT = path.join(ROOT, "assets", "fonts", "inter-latin-var.woff2");

// Référence .brand-mark (css/style.css) — toute modification là-bas doit être
// reportée ici pour que les icônes restent identiques à l'en-tête.
const BASE = 38;
const RADIUS = 10;
const FONT_SIZE = 14.4;
const FONT_WEIGHT = 800;
const LETTER_SPACING = 0.5;
const BLUE = "#2563eb";

const fontBase64 = readFileSync(FONT).toString("base64");

function badgeHtml(size, radius) {
  const k = size / BASE;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
@font-face {
  font-family: "Inter";
  src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
  font-weight: 100 900;
  font-style: normal;
}
html, body { margin: 0; padding: 0; background: transparent; }
.mark {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${size}px;
  height: ${size}px;
  border-radius: ${radius}px;
  background: ${BLUE};
  color: #fff;
  font-family: "Inter", sans-serif;
  font-size: ${(FONT_SIZE * k).toFixed(3)}px;
  font-weight: ${FONT_WEIGHT};
  letter-spacing: ${(LETTER_SPACING * k).toFixed(3)}px;
}
</style></head>
<body><div class="mark">AR</div></body></html>`;
}

const SORTIES = [
  { fichier: "favicon-16.png", size: 16, radius: (RADIUS * 16) / BASE },
  { fichier: "favicon-32.png", size: 32, radius: (RADIUS * 32) / BASE },
  // Full-bleed : aucun arrondi, iOS masque lui-même la tuile.
  { fichier: "apple-touch-icon.png", size: 180, radius: 0 }
];

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}

try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { fichier, size, radius } of SORTIES) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(badgeHtml(size, radius));
    await page.evaluate(() => document.fonts.ready);
    const sortie = path.join(ROOT, "assets", fichier);
    await page.screenshot({ path: sortie, omitBackground: true });
    const octets = readFileSync(sortie).length;
    console.log(`  ${fichier.padEnd(24)} ${String(size).padStart(3)}×${size}  ${(octets / 1024).toFixed(1)} Ko`);
  }
} finally {
  await browser.close();
}

console.log("Icônes du monogramme générées (source : badge .brand-mark, rendu Chrome + Inter).");
