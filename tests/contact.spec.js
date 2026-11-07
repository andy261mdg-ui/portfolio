const { test, expect } = require("@playwright/test");

// Aucun appel réel à Formspree : on intercepte systématiquement (quota du
// propriétaire + boîte mail réelle). Le comportement testé est celui du site.
test.beforeEach(async ({ page }) => {
  await page.route("**formspree.io/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' })
  );
  await page.goto("/");
});

test.describe("Formulaire de contact", () => {
  test("soumission vide : trois erreurs visibles, focus sur le premier champ", async ({ page }) => {
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.locator(".form-error:visible")).toHaveCount(3);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
    await expect(page.locator("#cf-name")).toBeFocused();
    await expect(page.locator("#form-status")).toHaveAttribute("data-state", "error");
    await expect(page.locator("#form-status")).toContainText("3 champs");
  });

  test("email invalide : message dédié, champ marqué et focus", async ({ page }) => {
    await page.fill("#cf-name", "Andy Test");
    await page.fill("#cf-email", "andy@");
    await page.fill("#cf-message", "Bonjour, je souhaite un devis pour cinq articles.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.locator("#cf-email-error")).toBeVisible();
    await expect(page.locator("#cf-email-error")).toContainText("adresse email valide");
    await expect(page.locator("#cf-email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#cf-email")).toBeFocused();
    await expect(page.locator("#cf-name-error")).toBeHidden();
  });

  test("l'erreur disparaît dès que le champ redevient conforme", async ({ page }) => {
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.locator("#cf-name-error")).toBeVisible();

    await page.fill("#cf-name", "Andy Test");

    await expect(page.locator("#cf-name-error")).toBeHidden();
    await expect(page.locator("#cf-name")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("envoi valide : statut de succès annoncé (Formspree intercepté)", async ({ page }) => {
    await page.fill("#cf-name", "Andy Test");
    await page.fill("#cf-email", "andy@example.fr");
    await page.fill("#cf-message", "Bonjour, je souhaite un devis pour cinq articles.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.locator("#form-status")).toHaveAttribute("data-state", "success");
    await expect(page.locator("#form-status")).toContainText("48 heures");
  });

  test("type de prestation : menu à 7 options, valeur transmise", async ({ page }) => {
    await expect(page.locator("#cf-subject option")).toHaveCount(7);
    await page.selectOption("#cf-subject", "Autre besoin");
    await expect(page.locator("#cf-subject")).toHaveValue("Autre besoin");
  });

  test("qualification : trois menus facultatifs, sans champ requis", async ({ page }) => {
    const menus = { "#cf-volume": 4, "#cf-frequency": 5, "#cf-deadline": 5 };
    for (const [id, nbOptions] of Object.entries(menus)) {
      const select = page.locator(id);
      await expect(select, id).toHaveCount(1);
      expect(await select.getAttribute("required"), `${id} sans required`).toBeNull();
      await expect(select.locator("option"), `${id} options`).toHaveCount(nbOptions);
      await expect(select, `${id} vide par défaut`).toHaveValue("");
    }
  });

  test("qualification : valeurs sélectionnées transmises", async ({ page }) => {
    await page.selectOption("#cf-volume", "Régulier (5 à 20 par mois)");
    await page.selectOption("#cf-frequency", "Hebdomadaire");
    await page.selectOption("#cf-deadline", "Dès que possible");

    await expect(page.locator("#cf-volume")).toHaveValue("Régulier (5 à 20 par mois)");
    await expect(page.locator("#cf-frequency")).toHaveValue("Hebdomadaire");
    await expect(page.locator("#cf-deadline")).toHaveValue("Dès que possible");
  });

  test("repli mailto : qualification reprise dans le corps du message", async ({ page }) => {
    // Échec simulé du service : le site bascule sur le lien mailto de secours.
    // (Route enregistrée après celle du beforeEach : elle prend la priorité.)
    await page.route("**formspree.io/**", (route) =>
      route.fulfill({ status: 500, contentType: "text/plain", body: "erreur" })
    );

    await page.fill("#cf-name", "Andy Test");
    await page.fill("#cf-email", "andy@example.fr");
    await page.selectOption("#cf-volume", "Régulier (5 à 20 par mois)");
    await page.selectOption("#cf-frequency", "Hebdomadaire");
    await page.fill("#cf-message", "Bonjour, je souhaite un devis pour cinq articles par mois.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    const lien = page.locator('#form-status a[href^="mailto:"]');
    await expect(lien).toBeVisible();
    const corps = decodeURIComponent(await lien.getAttribute("href"));
    expect(corps).toContain("Volume estimé : Régulier (5 à 20 par mois)");
    expect(corps).toContain("Fréquence souhaitée : Hebdomadaire");
  });

  test("chaque champ requis est relié à son message d'erreur", async ({ page }) => {
    for (const champ of ["#cf-name", "#cf-email", "#cf-message"]) {
      const cible = await page.locator(champ).getAttribute("aria-describedby");
      expect(cible, champ).toBeTruthy();
      for (const id of cible.split(/\s+/)) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
    }
  });
});

test.describe("Copie de l'adresse email", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("annonce via la région role=status et retour visuel", async ({ page }) => {
    await page.locator(".copy-btn").click();

    await expect(page.locator("#copy-status")).toHaveText(/Adresse copiée !/);
    await expect(page.locator(".copy-btn")).toHaveText(/Adresse copiée !/);
  });
});
