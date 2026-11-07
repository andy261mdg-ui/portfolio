// Génère le CV d'Andy (une page A4) depuis la page cv.html du site.
// Source : cv.html (versionnée : c'est aussi le CV consultable en ligne)
// Sortie : assets/cv/CV-Andy-Rakotondrabe.pdf (versionnée, liée par cv.html et index.html)
// Raccourci : npm run cv
import { chromium } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { access, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(RACINE, "cv.html");
const SORTIE = resolve(RACINE, "assets/cv/CV-Andy-Rakotondrabe.pdf");
const VARIANTE = resolve(RACINE, "assets/cv/CV-Andy-Rakotondrabe-linkedin.pdf");

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
const options = {
  printBackground: true,
  preferCSSPageSize: true, // respecte @page { size: A4; margin: 0 }
  // Balises d'accessibilité : sans cette option, Chromium n'écrit pas de
  // /StructTreeRoot et les lecteurs d'écran n'ont aucun ordre de lecture.
  tagged: true
};
await page.pdf({ ...options, path: SORTIE });

// Variante LinkedIn : même source, sans liens cliquables. Le fichier est
// envoyé depuis LinkedIn, où des liens mailto/WhatsApp dans le document n'ont
// pas d'usage et ressemblent à du démarchage. Une source, deux exports : la
// variante ne peut plus se désynchroniser du CV en ligne (elle avait deux
// pages et un ancien argumentaire).
await page.evaluate(() => {
  document.querySelectorAll("a[href]").forEach((lien) => lien.removeAttribute("href"));
});
await page.pdf({ ...options, path: VARIANTE });

await navigateur.close();

// Chrome/Skia n'exporte pas les <meta> HTML : on complète les métadonnées du
// PDF (auteur, sujet, mots-clés) avec pypdf — cf. tools/set-pdf-metadata.py.
// Contrôle d'accessibilité : le PDF doit rester balisé (structure, langue,
// titre affiché) et tenir sur une page. Sans ce garde-fou, une option perdue
// dans page.pdf() repasserait inaperçue jusqu'à un audit.
//
// Interpréteur Python : certains environnements (macOS récents, distros
// réparties) n'exposent que « python3 » — détection alignée sur tests/cv.spec.js.
function pythonCmd() {
  for (const cmd of ["python", "python3"]) {
    const probe = spawnSync(cmd, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return cmd;
  }
  return null;
}

const python = pythonCmd();
if (!python) {
  console.error(
    "Python introuvable (« python » ni « python3 ») : métadonnées et contrôle " +
      "d'accessibilité du PDF impossibles — installer Python 3 (pip install pypdf)."
  );
  process.exit(1);
}

for (const fichier of [SORTIE, VARIANTE]) {
  const meta = spawnSync(python, ["tools/set-pdf-metadata.py", fichier], {
    cwd: RACINE,
    stdio: "inherit"
  });
  if (meta.status !== 0) {
    console.error(`Échec : métadonnées non écrites (${fichier}).`);
    process.exit(1);
  }

  const controle = spawnSync(python, ["tools/check-pdf-a11y.py", fichier], {
    cwd: RACINE,
    stdio: "inherit"
  });
  if (controle.status !== 0) {
    console.error(`Échec : contrôle d'accessibilité (${fichier}).`);
    process.exit(1);
  }

  const { size } = await stat(fichier);
  console.log(`CV généré : ${fichier} (${Math.round(size / 1024)} Ko)`);
}
