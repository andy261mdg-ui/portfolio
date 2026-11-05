const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("liens externes : rel=noopener et mention « nouvel onglet »", async ({ page }) => {
  const liens = await page.$$eval('a[target="_blank"]', (ancres) =>
    ancres.map((a) => ({
      href: a.getAttribute("href"),
      rel: a.getAttribute("rel") || "",
      texte: a.textContent.replace(/\s+/g, " ").trim()
    }))
  );

  expect(liens.length).toBeGreaterThan(0);
  const fautifs = liens.filter(
    (l) => !/\bnoopener\b/.test(l.rel) || !/nouvel onglet/.test(l.texte)
  );
  expect(fautifs).toEqual([]);
});

test("ancres internes : chaque href=#... pointe sur un id existant", async ({ page }) => {
  const orphelines = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute("href"))
      .filter((href) => href.length > 1 && !document.getElementById(href.slice(1)))
  );
  expect(orphelines).toEqual([]);
});

test("images : alt et dimensions déclarées (pas de décalage de mise en page)", async ({ page }) => {
  const problemes = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((i) => i.getAttribute("alt") === null || !i.getAttribute("width") || !i.getAttribute("height"))
      .map((i) => i.getAttribute("src"))
  );
  expect(problemes).toEqual([]);
});

test("identifiants uniques et cibles aria valides", async ({ page }) => {
  const rapport = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);

    const cibles = [];
    for (const el of document.querySelectorAll("[aria-describedby], [aria-labelledby]")) {
      for (const attr of ["aria-describedby", "aria-labelledby"]) {
        const valeur = el.getAttribute(attr);
        if (!valeur) continue;
        for (const id of valeur.split(/\s+/)) {
          if (!document.getElementById(id)) cibles.push(`${attr}=${id}`);
        }
      }
    }

    const labelsOrphelins = [...document.querySelectorAll("label[for]")]
      .map((l) => l.getAttribute("for"))
      .filter((id) => !document.getElementById(id));

    return { doublons, cibles, labelsOrphelins };
  });

  expect(rapport).toEqual({ doublons: [], cibles: [], labelsOrphelins: [] });
});

test("ressources techniques servies (404 compris)", async ({ request }) => {
  const attendues = [
    "/",
    "/robots.txt",
    "/sitemap.xml",
    "/css/style.css",
    "/js/main.js",
    "/assets/cv/CV-Andy-Rakotondrabe.pdf",
    "/assets/img/andy-rakotondrabe-portrait-600.webp"
  ];
  for (const url of attendues) {
    const reponse = await request.get(url);
    expect(reponse.status(), url).toBe(200);
  }
});

test("sitemap : URL déclarée et lastmod plausible", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();

  expect(xml).toContain("<loc>https://andy261mdg-ui.github.io/portfolio/</loc>");

  const lastmod = (xml.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/) || [])[1];
  expect(lastmod, "lastmod présent").toBeTruthy();
  expect(new Date(lastmod).getTime(), "lastmod non futur").toBeLessThanOrEqual(Date.now() + 86400000);
});
