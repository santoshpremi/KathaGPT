import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem("kathgpt_onboarded", "true");
    });
    await use(page);
  },
});

export { expect };
