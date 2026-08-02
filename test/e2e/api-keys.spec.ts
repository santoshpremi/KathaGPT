import { test, expect } from "./fixtures";
import { gotoChatsHome } from "./helpers";

test("API keys modal shows all LLM providers", async ({ page }) => {
  await gotoChatsHome(page);

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
