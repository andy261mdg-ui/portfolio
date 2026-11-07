const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("Structure et contenu", () => {
  test("grilles complètes (6 / 6 / 6) et aucun débordement horizontal", async ({ page }) => {
    await expect(page.locator("#services .cards-grid > *")).toHaveCount(6);
    await expect(page.locator("#realisations .cards-grid > *")).toHaveCount(6);
    await expect(page.locator(".faq-item")).toHaveCount(7);

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

  test("disponibilité annoncée dans le hero et la liste de contact", async ({ page }) => {
    await expect(page.locator(".hero-availability")).toHaveText(
      "Disponible pour de nouvelles missions"
    );
    await expect(page.locator(".contact-list")).toContainText(
      "Disponible pour de nouvelles missions"
    );
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
      // Section courante annoncée hors couleur (WCAG 1.4.1) : un seul lien porte
      // aria-current, et c'est celui de la section visible.
      await expect(
        page.locator(`.nav-list a[aria-current="location"][href="#${section}"]`)
      ).toHaveCount(1);
      await expect(page.locator(".nav-list a[aria-current]")).toHaveCount(1);
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

test.describe("Taille de texte agrandie (WCAG 1.4.4)", () => {
  test("l'en-tête grandit au lieu de rogner ou déborder (texte à 200 %)", async ({ page }) => {
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await page.waitForTimeout(200); // laisser le ResizeObserver de l'en-tête se déclencher

    const resultat = await page.evaluate(() => {
      const header = document.querySelector(".site-header").getBoundingClientRect();
      const cibles = Array.prototype.slice.call(
        document.querySelectorAll(
          ".site-header .brand, .site-header .nav-list a, .site-header .nav-toggle"
        )
      ).filter((el) => el.getBoundingClientRect().width > 0); // liens masqués = mobile fermé

      const rognes = cibles
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < header.top - 1 || r.bottom > header.bottom + 1;
        })
        .map((el) => el.textContent.trim() || el.className);

      return {
        rognes: rognes,
        debordement:
          document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(resultat.rognes).toEqual([]);
    expect(resultat.debordement).toBe(0);
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

  test("fermeture en cliquant hors de la navigation", async ({ page }) => {
    const bouton = page.locator("#nav-toggle");
    const menu = page.locator("#menu");

    await bouton.click();
    await expect(menu).toBeVisible();

    // Clic réel sur le fond de l'en-tête, à gauche de la marque : ni le menu
    // ni le bouton ne reçoivent l'événement, le menu doit se refermer.
    await page.mouse.click(10, 20);

    await expect(menu).toBeHidden();
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
  });

  test("fermeture quand le focus sort de la navigation", async ({ page }) => {
    const bouton = page.locator("#nav-toggle");
    const menu = page.locator("#menu");

    await bouton.click();
    await expect(menu).toBeVisible();

    // Tabulation depuis le dernier lien du menu : le focus entre dans le
    // contenu principal, le menu ouvert ne doit pas rester affiché.
    await menu.locator("a").last().focus();
    await page.keyboard.press("Tab");

    await expect(menu).toBeHidden();
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Alignement des textes (mobile & tablette)", () => {
  test.skip(({ isMobile }) => !isMobile, "une seule passe, exécutée sur le projet mobile");

  const PAGES = ["/", "/confidentialite.html"];
  const VUES = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ];
  const TEXTES =
    ".hero-tagline, .hero-promise, .hero-availability, .hero-reassurance, .hero-meta, " +
    ".section-lead, .prose p, .prose li, .card-text, " +
    ".faq-item summary, .faq-answer p, .faq-answer li, .faq-cta, " +
    ".form-help, .form-status, .contact-lead";

  test("tous les textes de blocs sont justifiés", async ({ page }) => {
    for (const url of PAGES) {
      await page.goto(url);
      for (const vue of VUES) {
        await page.setViewportSize(vue);
        if (url === "/") {
          // Ouvre la première question : les réponses font partie du périmètre.
          await page.evaluate(() => {
            const item = document.querySelector(".faq-item");
            if (item && !item.hasAttribute("open")) item.setAttribute("open", "");
          });
        }

        const etats = await page.evaluate((selecteur) => {
          return [...document.querySelectorAll(selecteur)].map((el) => ({
            cible: el.className || el.tagName,
            alignement: getComputedStyle(el).textAlign,
          }));
        }, TEXTES);

        expect(etats.length, `${url} @ ${vue.width} px`).toBeGreaterThan(0);
        for (const etat of etats) {
          expect(etat.alignement, `${url} @ ${vue.width} px — ${etat.cible}`).toBe(
            "justify"
          );
        }
      }
    }
  });

  test("photo du hero alignée sur la colonne de texte", async ({ page }) => {
    await page.goto("/");
    for (const vue of VUES) {
      await page.setViewportSize(vue);
      const ecart = await page.evaluate(() => {
        const photo = document.querySelector(".hero-photo").getBoundingClientRect();
        const texte = document.querySelector(".hero-tagline").getBoundingClientRect();
        return Math.abs(photo.left - texte.left);
      });
      expect(ecart, `écart à ${vue.width} px`).toBeLessThanOrEqual(1);
    }
  });

  test("intro Contact sur la mesure commune des blocs de texte", async ({ page }) => {
    await page.goto("/");
    for (const vue of VUES) {
      await page.setViewportSize(vue);
      const largeurs = await page.evaluate(() => ({
        intro: document.querySelector(".contact-lead").getBoundingClientRect().width,
        mesure: document.querySelector(".about-box").getBoundingClientRect().width,
      }));
      expect(
        Math.abs(largeurs.intro - largeurs.mesure),
        `à ${vue.width} px`
      ).toBeLessThanOrEqual(2);
    }
  });

  test("aucun débordement horizontal", async ({ page }) => {
    await page.goto("/");
    for (const vue of VUES) {
      await page.setViewportSize(vue);
      const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(debordement, `à ${vue.width} px`).toBe(0);
    }
  });
});
