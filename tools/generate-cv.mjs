// Génère le CV d'Andy (une page A4) depuis la page cv.html du site.
// Source : cv.html (versionnée : c'est aussi le CV consultable en ligne)
// Sortie : assets/cv/CV-Andy-Rakotondrabe.pdf (versionnée, liée par cv.html et index.html)
// Raccourci : npm run cv
import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { access, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(RACINE, "cv.html");
const SORTIE = resolve(RACINE, "assets/cv/CV-Andy-Rakotondrabe.pdf");

try {
  await access(SOURCE);
} catch {
  console.error(`Source introuvable : ${SOURCE}`);
  process.exit(1);
}

const navigateur = await chromium.launch(
  process.env.CI ? {} : { channel: "chrome" }
);
const page = await navigateur.newPage();

// En file://, le preload de police (crossorigin) peut retarder l'événement
// load : on attend le DOM puis explicitement les polices et les images, ce
// qui garantit que le PDF est rendu avec Inter et le logo, sans attente
// indéterminée.
await page.goto(pathToFileURL(SOURCE).href, { waitUntil: "domcontentloaded" });
await page.emulateMedia({ media: "print" });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(
    [...document.images].map((img) =>
      img.complete
        ? null
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  );
});
await page.pdf({
  path: SORTIE,
  printBackground: true,
  preferCSSPageSize: true, // respecte @page { size: A4; margin: 0 }
  // Balises d'accessibilité : sans cette option, Chromium n'écrit pas de
  // /StructTreeRoot et les lecteurs d'écran n'ont aucun ordre de lecture.
  tagged: true
});
await navigateur.close();

// Chrome/Skia n'exporte pas les <meta> HTML : on complète les métadonnées du
// PDF (auteur, sujet, mots-clés) avec pypdf — cf. tools/set-pdf-metadata.py.
const meta = spawnSync("python", ["tools/set-pdf-metadata.py", SORTIE], {
  cwd: RACINE,
  stdio: "inherit"
});
if (meta.status !== 0) {
  console.error("Échec : métadonnées du CV non écrites.");
  process.exit(1);
}

const { size } = await stat(SORTIE);

// Contrôle d'accessibilité : le PDF doit rester balisé (structure, langue,
// titre affiché) et tenir sur une page. Sans ce garde-fou, une option perdue
// dans page.pdf() repasserait inaperçue jusqu'à un audit.
const controle = spawnSync("python", ["tools/check-pdf-a11y.py", SORTIE], {
  cwd: RACINE,
  stdio: "inherit"
});
if (controle.status !== 0) {
  console.error("Échec : contrôle d'accessibilité du CV.");
  process.exit(1);
}

console.log(`CV généré : ${SORTIE} (${Math.round(size / 1024)} Ko)`);
