import { test, expect } from "./fixtures";

const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";

test("API keys modal shows all LLM providers", async ({ page }) => {
  await page.goto(`/${ORG_ID}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/chats/`), {
    timeout: 20_000,
  });

  await page
    .getByRole("button", { name: /Local User|John Doe/ })
    .click();
  await page.getByRole("menuitem", { name: "API Keys" }).click();

  await expect(
    page.getByText("LLM providers", { exact: true }),
  ).toBeVisible({ timeout: 10_000 });
  for (const provider of [
    "OpenRouter",
    "OpenAI",
    "Anthropic",
    "Google Gemini",
    "Perplexity",
  ]) {
    await expect(page.getByText(provider, { exact: true })).toBeVisible();
  }
});
