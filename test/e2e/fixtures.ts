import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem("kathagpt_onboarded", "true");
      sessionStorage.removeItem("kathagpt-session-started");
    });
    await use(page);
  },
});

export { expect };
