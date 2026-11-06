// Génère le CV d'Andy (une page A4) à partir de sa source HTML.
// Source : sources/cv/CV-Andy-Rakotondrabe.html (locale, ignorée par Git)
// Sortie : assets/cv/CV-Andy-Rakotondrabe.pdf (versionnée, liée par index.html)
// Raccourci : npm run cv
import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { access, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(RACINE, "sources/cv/CV-Andy-Rakotondrabe.html");
const SORTIE = resolve(RACINE, "assets/cv/CV-Andy-Rakotondrabe.pdf");

try {
  await access(SOURCE);
} catch {
  console.error(`Source introuvable : ${SOURCE}`);
  console.error("Le CV se régénère depuis sa source HTML (non versionnée, conservée en local).");
  process.exit(1);
}

const navigateur = await chromium.launch(
  process.env.CI ? {} : { channel: "chrome" }
);
const page = await navigateur.newPage();

await page.goto(pathToFileURL(SOURCE).href, { waitUntil: "load" });
await page.pdf({
  path: SORTIE,
  printBackground: true,
  preferCSSPageSize: true // respecte @page { size: A4; margin: 0 }
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
console.log(`CV généré : ${SORTIE} (${Math.round(size / 1024)} Ko)`);
