const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Structure et contenu", () => {
  test("grilles complètes (6 / 6 / 6) et aucun débordement horizontal", async ({ page }) => {
    await expect(page.locator("#services .cards-grid > *")).toHaveCount(6);
    await expect(page.locator("#realisations .cards-grid > *")).toHaveCount(6);
    await expect(page.locator(".faq-item")).toHaveCount(6);

    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(debordement).toBe(0);
  });

  test("année du pied de page injectée", async ({ page }) => {
    await expect(page.locator("#year")).toHaveText(/^\d{4}$/);
  });

  test("hero : hiérarchie promesse > sous-titre > tagline", async ({ page }) => {
    const tailles = await page.evaluate(() => {
      const fs = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      return {
        promesse: fs(".hero-promise"),
        sousTitre: fs(".hero-subtitle"),
        tagline: fs(".hero-tagline")
      };
    });
    expect(tailles.promesse).toBeGreaterThan(tailles.sousTitre);
    expect(tailles.sousTitre).toBeGreaterThan(tailles.tagline);
  });

  test("hero : un seul appel à l'action primaire, format du CV annoncé", async ({ page }) => {
    await expect(page.locator(".hero-actions .btn-primary")).toHaveCount(1);
    await expect(page.locator(".hero-actions .btn-primary")).toHaveText("Parlons de votre projet");
    await expect(page.locator(".hero-actions .btn").last()).toContainText("PDF");
    await expect(page.locator(".hero-reassurance")).toContainText("48 heures ouvrées");
  });
});

test.describe("Interactions", () => {
  test("scrollspy : le lien actif suit les cinq sections", async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });

    for (const section of ["a-propos", "services", "realisations", "faq", "contact"]) {
      await page.evaluate((id) => {
        document.getElementById(id).scrollIntoView();
      }, section);
      await expect(page.locator(`.nav-list a.active[href="#${section}"]`)).toHaveCount(1);
    }
  });

  test("FAQ : une seule question ouverte à la fois", async ({ page }) => {
    const items = page.locator(".faq-item");

    await items.nth(1).locator("summary").click();
    expect(await items.nth(1).evaluate((el) => el.open)).toBe(true);

    await items.nth(3).locator("summary").click();
    expect(await items.nth(3).evaluate((el) => el.open)).toBe(true);
    expect(await page.locator(".faq-item[open]").count()).toBe(1);
  });
});

test.describe("Menu de navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "comportement mobile uniquement");

  test("ouverture, fermeture par Échap et retour du focus sur le bouton", async ({ page }) => {
    const bouton = page.locator("#nav-toggle");
    const menu = page.locator("#menu");

    await expect(bouton).toBeVisible();
    await expect(menu).toBeHidden();

    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeHidden();
    await expect(bouton).toBeFocused();
  });
});
