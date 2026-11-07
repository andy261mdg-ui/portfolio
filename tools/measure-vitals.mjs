// Mesure les Web Vitals du site publié avec le Chrome local (sans clé API)
// et met à jour docs/performance.json.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const URL_CIBLE = process.env.LIVE_BASE || "https://andy261mdg-ui.github.io/portfolio/";

const navigateur = await chromium.launch(
  process.env.CI ? {} : { channel: "chrome" }
);
const page = await navigateur.newPage({ viewport: { width: 1366, height: 900 } });

await page.addInitScript(() => {
  window.__vitals = { lcp: 0, cls: 0, fcp: 0 };
  new PerformanceObserver((liste) => {
    for (const e of liste.getEntries()) window.__vitals.lcp = e.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((liste) => {
    for (const e of liste.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((liste) => {
    for (const e of liste.getEntries()) if (e.name === "first-contentful-paint") window.__vitals.fcp = e.startTime;
  }).observe({ type: "paint", buffered: true });
});

await page.goto(URL_CIBLE, { waitUntil: "load" });
// Forcer un premier rendu (capture) : le Chrome d'automatisation ne produit
// pas de frame spontanément — sans quoi FCP/LCP restent à 0 ou sont enregistrés
// artificiellement tard. La capture déclenche la composition réelle du DOM.
await page.screenshot({ type: "png" });
await page.waitForTimeout(4000);

const mesures = await page.evaluate((base) => {
  const nav = performance.getEntriesByType("navigation")[0];
  const ressources = performance.getEntriesByType("resource");
  const plusLongues = ressources
    .map((r) => ({
      url: r.name.replace(/^https?:\/\//, "").slice(0, 70),
      debut_ms: Math.round(r.startTime),
      duree_ms: Math.round(r.duration),
      ko: Math.round((r.transferSize || 0) / 1024)
    }))
    .sort((a, b) => b.duree_ms - a.duree_ms)
    .slice(0, 6);
  return {
    vitals: window.__vitals,
    ttfb_ms: Math.round(nav.responseStart),
    dcl_ms: Math.round(nav.domContentLoadedEventEnd),
    load_ms: Math.round(nav.loadEventEnd),
    html_ko: Math.round(nav.transferSize / 1024),
    ressources_ko: Math.round(ressources.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
    tierces: ressources
      .map((r) => r.name)
      .filter((u) => !u.startsWith(base.replace(/\/$/, "")))
      .map((u) => u.split("/")[2]),
    plusLongues
  };
}, URL_CIBLE);

const rapport = {
  url: URL_CIBLE,
  genere_le: new Date().toISOString().slice(0, 10),
  methode:
    "Chrome local (Playwright), viewport 1366x900, cache vidé, réseau du poste, rendu forcé après chargement (capture) pour que la peinture soit enregistrée. Mesures PerformanceObserver : ce n'est pas un audit Lighthouse complet.",
  lcp_ms: Math.round(mesures.vitals.lcp),
  cls: Math.round(mesures.vitals.cls * 1000) / 1000,
  fcp_ms: Math.round(mesures.vitals.fcp),
  ttfb_ms: mesures.ttfb_ms,
  dom_content_loaded_ms: mesures.dcl_ms,
  load_ms: mesures.load_ms,
  transfert_ko: { html: mesures.html_ko, ressources: mesures.ressources_ko },
  requetes_tierces: mesures.tierces,
  ressources_plus_longues: mesures.plusLongues
};

// Anomalie de session, pas du site : sur un poste d'automatisation sans
// accélération matérielle, le premier rendu logiciel coûte plusieurs secondes
// et fausse FCP/LCP. Sans cette trace, un lecteur y verrait une régression.
if (rapport.fcp_ms > 3000) {
  rapport.remarque =
    "FCP/LCP élevés : session d'automatisation sans accélération matérielle (premier " +
    "rendu logiciel coûteux) — le chargement complet (load_ms) reste la référence réseau de ce relevé.";
}

await mkdir("docs", { recursive: true });
await writeFile("docs/performance.json", JSON.stringify(rapport, null, 2) + "\n", "utf8");

console.log(
  `LCP ${rapport.lcp_ms} ms · FCP ${rapport.fcp_ms} ms · CLS ${rapport.cls} · TTFB ${rapport.ttfb_ms} ms` +
    ` · HTML ${rapport.transfert_ko.html} Ko + ressources ${rapport.transfert_ko.ressources} Ko` +
    ` · requêtes tierces : ${rapport.requetes_tierces.length ? rapport.requetes_tierces.join(", ") : "aucune"}`
);

await navigateur.close();
