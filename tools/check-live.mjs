// Contrôle hebdomadaire du site réellement publié (GitHub Pages).
// Détecte : page indisponible, ressources cassées, régression de contenu
// (title, CTA du hero), sitemap et robots.txt.
const BASE = process.env.LIVE_BASE || "https://andy261mdg-ui.github.io/portfolio/";

const ATTENDUES = [
  ["page d'accueil", BASE],
  ["robots.txt", new URL("robots.txt", BASE).href],
  ["sitemap.xml", new URL("sitemap.xml", BASE).href],
  ["feuille de style", new URL("css/style.css", BASE).href],
  ["script", new URL("js/main.js", BASE).href],
  ["CV (page en ligne)", new URL("cv.html", BASE).href],
  ["CV (PDF)", new URL("assets/cv/CV-Andy-Rakotondrabe.pdf", BASE).href]
];

const CONTENUS = [
  ["titre orienté métier", /<title>[^<]*R[ée]dacteur web freelance/],
  ["CTA principal du hero", /Parlons de votre projet/],
  ["micro-réassurance 48 heures", /R[ée]ponse sous 48 heures ouvr[ée]es/],
  ["type de prestation (menu)", /Type de prestation/],
  ["meta description ≤ 160 caractères", /<meta name="description" content="(?=[^"]{1,160}")[^"]*r[ée]dacteur web freelance[^"]*"/],
  ["données structurées FAQPage", /"@type":\s*"FAQPage"/],
  ["positionnement SEO dans le titre", /<title>[^<]*R[ée]dacteur web freelance SEO/],
  // Le positionnement SEO/GEO doit survivre aux réécritures : sans ces deux
  // contrôles, un retour au discours « rédacteur web généraliste » passerait
  // inaperçu en production.
  ["champ lexical : intention de recherche", /intentions?\s+de\s+recherche/],
  ["champ lexical : GEO", /\(GEO\)/]
];

const problemes = [];

async function verifier() {
  const cache = `?cb=${Date.now()}`;

  for (const [nom, url] of ATTENDUES) {
    try {
      const reponse = await fetch(url + (url.includes("?") ? "&" : "") + cache, {
        redirect: "follow",
        headers: { "User-Agent": "portfolio-qa" }
      });
      if (!reponse.ok) problemes.push(`${nom} : HTTP ${reponse.status}`);
      else console.log(`  OK    ${nom} (${reponse.status})`);
    } catch (erreur) {
      problemes.push(`${nom} : ${erreur.message}`);
    }
  }

  const html = await (await fetch(BASE + cache, { headers: { "User-Agent": "portfolio-qa" } })).text();
  for (const [nom, motif] of CONTENUS) {
    if (motif.test(html)) console.log(`  OK    ${nom}`);
    else problemes.push(`contenu manquant : ${nom}`);
  }
}

verifier().then(() => {
  if (problemes.length) {
    console.error("\nSite en ligne : ECHEC");
    for (const p of problemes) console.error(" - " + p);
    process.exit(1);
  }
  console.log("\nSite en ligne : OK");
});
