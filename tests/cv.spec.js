// CV : la page en ligne et le PDF généré depuis cette page.
// Le PDF doit rester balisé (ordre de lecture) : c'est la limite levée en
// novembre 2026, contrôlée ici pour qu'elle ne revienne pas en silence.
const { test, expect } = require("@playwright/test");
const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");

const PDF = join(__dirname, "..", "assets", "cv", "CV-Andy-Rakotondrabe.pdf");

function python() {
  for (const commande of ["python", "python3"]) {
    const essai = spawnSync(commande, ["--version"], { encoding: "utf8" });
    if (essai.status === 0) return commande;
  }
  return null;
}

test("CV : page en ligne, structure sémantique et lien vers le PDF", async ({ page }) => {
  await page.goto("/cv.html");

  await expect(page.locator("h1")).toHaveCount(1);

  // textContent (et non innerText) : les titres sont mis en majuscules par CSS,
  // ce n'est pas le contenu à contrôler.
  const titres = await page.locator(".cv-section h2").allTextContents();
  expect(titres).toEqual(["Profil", "Expérience", "Formation", "Compétences"]);

  const pdf = page.locator('a[href="assets/cv/CV-Andy-Rakotondrabe.pdf"]');
  await expect(pdf).toHaveAttribute("download", "");

  expect(await page.evaluate(() => document.body.innerText)).not.toContain("\u2014");
});

test("CV : PDF balisé (structure de lecture, langue, titre affiché)", async () => {
  const commande = python();
  test.skip(!commande, "Python indisponible : contrôle du balisage PDF ignoré");
  expect(existsSync(PDF), "PDF du CV présent").toBe(true);

  const controle = spawnSync(commande, ["tools/check-pdf-a11y.py", PDF], {
    cwd: join(__dirname, ".."),
    encoding: "utf8"
  });

  expect(controle.stdout.trim(), controle.stdout + controle.stderr).toContain("OK");
  expect(controle.status).toBe(0);
});
