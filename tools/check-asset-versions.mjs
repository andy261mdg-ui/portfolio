// Garde-fou anti-oubli : si css/style.css ou js/main.js change, le paramètre
// de version (?v=) doit changer aussi dans les pages HTML, sinon les visiteurs
// gardent l'ancien fichier en cache (GitHub Pages : Cache-Control max-age=600).
//
// Compare l'état courant au commit de référence (HEAD~1 par défaut, surchargeable
// avec GUARD_BASE — en CI : SHA du commit précédant le push). Sortie : code 1 si
// une version n'a pas été incrémentée, si un ?v= est absent d'une page, ou si la
// base de comparaison est introuvable (le contrôle refuse de conclure à tort).
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = process.env.GUARD_BASE || "HEAD~1";
// Le CSS est chargé par les quatre pages ; le JS uniquement par les trois
// pages qui incluent main.js (404.html n'en charge pas).
const PAGES_CSS = ["index.html", "cv.html", "404.html", "confidentialite.html"];
const PAGES_JS = ["index.html", "cv.html", "confidentialite.html"];

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
// Le paramètre ?v= doit exister sur chaque page qui charge la ressource.
// Une page sans ?v= ou disparue est une erreur explicite : le contrôle ne
// doit jamais conclure « OK » par défaut (défaut ancien : une version
// absente n'était pas collectée et laissait le contrôle passer).
const cssVersions = new Set();
const jsVersions = new Set();

const lirePage = (page) => {
  try {
    return lire(page);
  } catch {
    erreurs.push(`Page manquante : ${page} — contrôle des ?v= impossible sur ce fichier.`);
    return null;
  }
};

for (const page of PAGES_CSS) {
  const html = lirePage(page);
  if (!html) continue;
  const css = versionCss(html);
  if (css) cssVersions.add(css);
  else erreurs.push(`${page} : paramètre style.css?v= absent.`);
}
for (const page of PAGES_JS) {
  const html = lirePage(page);
  if (!html) continue;
  const js = versionJs(html);
  if (js) jsVersions.add(js);
  else erreurs.push(`${page} : paramètre main.js?v= absent.`);
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
  const baseInvalide = modifsDernierCommit === null;

  if (baseInvalide && toucheLocal.length === 0) {
    // Rien en local : la comparaison devrait se faire contre la base, qui est
    // introuvable (ref non fetchée, GUARD_BASE invalide…). Refuser explicitement
    // plutôt que de conclure à tort « rien à vérifier ».
    erreurs.push(
      `Base de comparaison « ${BASE} » introuvable : impossible de vérifier l'incrément ?v= du dernier commit ` +
        `(vérifier GUARD_BASE ou l'historique fetché) — contrôle refusé plutôt que verdict à tort.`
    );
  } else {
    const toucheCommit = modifsDernierCommit
      ? surveilles.filter((f) => modifsDernierCommit.includes(f))
      : [];

    // Référence de comparaison : l'arbre de travail si des modifications sont
    // locales, sinon le commit de référence (cas de la CI).
    const reference = toucheLocal.length ? "HEAD" : toucheCommit.length ? BASE : null;

    if (reference) {
      const anciennePage = show(reference, "index.html");
      let actuelle = null;
      try {
        actuelle = lire("index.html");
      } catch {
        actuelle = null;
      }

      if (!anciennePage || !actuelle) {
        erreurs.push(
          `index.html illisible (dans « ${reference} » : ${anciennePage ? "oui" : "non"} ; ` +
            `en arbre de travail : ${actuelle ? "oui" : "non"}) : contrôle d'incrément impossible — contrôle refusé.`
        );
      } else {
        // On ne contrôle que les fichiers réellement concernés par la
        // comparaison : modifications locales si l'on compare à HEAD, sinon
        // celles du dernier commit.
        const fichiers = reference === "HEAD" ? toucheLocal : toucheCommit;

        if (fichiers.includes("css/style.css")) {
          const avant = versionCss(anciennePage);
          const apres = versionCss(actuelle);
          if (avant === apres) {
            erreurs.push(
              `css/style.css a changé mais style.css?v=${apres} n'a pas été incrémenté dans ${PAGES_CSS.join(", ")}.`
            );
          }
        }

        if (fichiers.includes("js/main.js")) {
          const avant = versionJs(anciennePage);
          const apres = versionJs(actuelle);
          if (avant === apres) {
            erreurs.push(
              `js/main.js a changé mais main.js?v=${apres} n'a pas été incrémenté ` +
                `(index.html, cv.html, confidentialite.html).`
            );
          }
        }
      }
    } else {
      console.log("[info] Aucune modification de css/style.css ni de js/main.js : rien à vérifier.");
    }
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
