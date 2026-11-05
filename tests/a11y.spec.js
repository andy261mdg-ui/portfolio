const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const PAGES = [
  ["accueil", "/"],
  ["confidentialité", "/confidentialite.html"],
  ["page 404", "/404.html"]
];

for (const [nom, url] of PAGES) {
  test(`aucune violation d'accessibilité sérieuse ou critique — ${nom}`, async ({ page }) => {
    await page.goto(url);

    const resultat = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const graves = resultat.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    const resume = graves.map(
      (v) => `${v.id} [${v.impact}] : ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`
    );
    expect(resume).toEqual([]);
  });

  test(`titre et langue déclarés — ${nom}`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle(/\S/);
    expect(await page.locator("html").getAttribute("lang")).toBe("fr");
  });
}
