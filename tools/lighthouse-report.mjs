// Récupère les scores Lighthouse via l'API PageSpeed Insights (mobile + desktop)
// et enregistre une synthèse dans docs/. À lancer manuellement après publication.
// Code 1 si moins des deux stratégies réussissent : jamais de sortie « verte »
// sur un audit partiel ou raté (défaut ancien : exit 0 même si tout échouait).
import { mkdir, writeFile } from "node:fs/promises";

const URL_CIBLE = process.env.PSI_URL || "https://andy261mdg-ui.github.io/portfolio/";

const METRIQUES = {
  "first-contentful-paint": "FCP",
  "largest-contentful-paint": "LCP",
  "total-blocking-time": "TBT",
  "cumulative-layout-shift": "CLS",
  "speed-index": "Speed Index"
};

async function rapport(strategie) {
  const cle = process.env.PSI_KEY ? `&key=${process.env.PSI_KEY}` : "";
  const api =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" +
    `?url=${encodeURIComponent(URL_CIBLE)}&strategy=${strategie}` +
    "&category=performance&category=accessibility&category=best-practices&category=seo" +
    cle;

  const reponse = await fetch(api);
  if (reponse.status === 429) {
    throw new Error(
      "quota dépassé — l'API PageSpeed exige une clé (variable PSI_KEY), voir README"
    );
  }
  if (!reponse.ok) throw new Error(`${strategie} : HTTP ${reponse.status}`);
  const data = await reponse.json();
  const lh = data.lighthouseResult;

  const scores = {};
  for (const [cle, valeur] of Object.entries(lh.categories)) {
    scores[cle] = Math.round(valeur.score * 100);
  }

  const metriques = {};
  for (const [audit, nom] of Object.entries(METRIQUES)) {
    const a = lh.audits[audit];
    metriques[nom] = a ? a.displayValue || a.numericValue : null;
  }

  return {
    url: URL_CIBLE,
    strategie,
    genere_le: new Date().toISOString().slice(0, 10),
    scores,
    metriques
  };
}

const resultats = [];
for (const strategie of ["mobile", "desktop"]) {
  try {
    const r = await rapport(strategie);
    resultats.push(r);
    console.log(`  ${strategie} :`, JSON.stringify(r.scores), JSON.stringify(r.metriques));
  } catch (e) {
    console.error(`  ${strategie} : ECHEC — ${e.message}`);
  }
}

if (resultats.length) {
  await mkdir("docs", { recursive: true });
  await writeFile("docs/lighthouse.json", JSON.stringify(resultats, null, 2) + "\n", "utf8");
  console.log("Écrit dans docs/lighthouse.json");
}

if (resultats.length < 2) {
  console.error(
    `Audit incomplet : ${resultats.length}/2 stratégies réussi(es) — scores partiels non concluants ` +
      `(quota PSI : clé PSI_KEY requise, voir README).`
  );
  process.exit(1);
}
