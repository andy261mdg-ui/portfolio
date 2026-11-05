// Configuration des tests de non-régression.
// En local, on réutilise le Chrome installé (aucun téléchargement) ;
// en CI, Playwright utilise son Chromium (`npx playwright install chromium`).
const { defineConfig } = require("@playwright/test");

const PORT = 8765;
const baseURL = `http://localhost:${PORT}/`;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    ...(process.env.CI ? {} : { channel: "chrome" })
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1366, height: 900 } }
    },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
    }
  ],
  webServer: {
    command: `node tools/serve.mjs ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 20000
  }
});
