// Garde-fou anti-oubli : si css/style.css ou js/main.js change, le paramètre
// de version (?v=) doit changer aussi dans les pages HTML, sinon les visiteurs
// gardent l'ancien fichier en cache (GitHub Pages : Cache-Control max-age=600).
//
// Compare l'état courant au commit de référence (HEAD~1 par défaut, surchargeable
// avec GUARD_BASE). Sortie : code 1 si une version n'a pas été incrémentée.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = process.env.GUARD_BASE || "HEAD~1";
const PAGES = ["index.html", "cv.html", "404.html", "confidentialite.html"];

const lire = (fichier) => readFileSync(fichier, "utf8");
const versionCss = (html) => (html.match(/style\.css\?v=(\d+)/) || [])[1];
const versionJs = (html) => (html.match(/main\.js\?v=(\d+)/) || [])[1];

function show(ref, fichier) {
  try {
    return execSync(`git show ${ref}:${fichier}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

const erreurs = [];

// 1. Cohérence entre les pages (une page oubliée = cache incohérent).
const cssVersions = new Set();
const jsVersions = new Set();
for (const page of PAGES) {
  let html;
  try {
    html = lire(page);
  } catch {
    continue;
  }
  const css = versionCss(html);
  const js = versionJs(html);
  if (css) cssVersions.add(css);
  if (js) jsVersions.add(js);
}
if (cssVersions.size > 1) {
  erreurs.push(`Versions de style.css différentes selon les pages : ${[...cssVersions].join(", ")}`);
}
if (jsVersions.size > 1) {
  erreurs.push(`Versions de main.js différentes selon les pages : ${[...jsVersions].join(", ")}`);
}

// 2. Un fichier modifié sans incrément de version.
const git = (args) => {
  try {
    return execSync(`git ${args}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return null;
  }
};

const modifsNonCommitees = git("diff --name-only HEAD");
const modifsDernierCommit = git(`diff --name-only ${BASE} HEAD`);

if (modifsNonCommitees === null) {
  console.log("[info] Dépôt Git indisponible : contrôle d'incrément ignoré.");
} else {
  const surveilles = ["css/style.css", "js/main.js"];
  const toucheLocal = surveilles.filter((f) => modifsNonCommitees.includes(f));
  const toucheCommit = modifsDernierCommit ? surveilles.filter((f) => modifsDernierCommit.includes(f)) : [];

  // Référence de comparaison : le dernier commit si les modifications sont dans
  // l'arbre de travail, sinon le commit précédent (cas de la CI).
  const reference = toucheLocal.length ? "HEAD" : toucheCommit.length ? BASE : null;

  if (reference) {
    const anciennePage = show(reference, "index.html");
    const actuelle = lire("index.html");

    // On ne contrôle que les fichiers réellement concernés par la comparaison :
    // les modifications locales si l'on compare à HEAD, sinon celles du dernier commit.
    const fichiers = reference === "HEAD" ? toucheLocal : toucheCommit;

    if (fichiers.includes("css/style.css")) {
      const avant = anciennePage && versionCss(anciennePage);
      const apres = versionCss(actuelle);
      if (avant === apres) {
        erreurs.push(
          `css/style.css a changé mais style.css?v=${apres} n'a pas été incrémenté dans ${PAGES.join(", ")}.`
        );
      }
    }

    if (fichiers.includes("js/main.js")) {
      const avant = anciennePage && versionJs(anciennePage);
      const apres = versionJs(actuelle);
      if (avant === apres) {
        erreurs.push(
          `js/main.js a changé mais main.js?v=${apres} n'a pas été incrémenté (index.html, confidentialite.html).`
        );
      }
    }
  } else {
    console.log("[info] Aucune modification de css/style.css ni de js/main.js : rien à vérifier.");
  }
}

if (erreurs.length) {
  console.error("Garde-fou des versions : ECHEC");
  for (const e of erreurs) console.error(" - " + e);
  process.exit(1);
}

console.log(
  `Garde-fou des versions : OK (style.css?v=${[...cssVersions].join("/")}, main.js?v=${[...jsVersions].join("/")})`
);
