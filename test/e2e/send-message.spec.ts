import { test, expect } from "./fixtures";

const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";

test("sending Hi returns an AI response", async ({ page }) => {
  const trpcErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") trpcErrors.push(msg.text());
  });

  await page.goto(`/${ORG_ID}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/chats/`), {
    timeout: 20_000,
  });

  await page.getByTestId("sidebar-new-chat-button").click();
  await expect(page.getByText("How can I help you today?")).toBeVisible({
    timeout: 15_000,
  });

  const input = page.getByTestId("chat-input");
  await expect(input).toBeVisible({ timeout: 15_000 });
  await input.fill("Hi");
  await page.getByTestId("submit-message-button").click();

  await expect(page.locator("body")).not.toContainText(
    "IterablesAndDeferreds",
    { timeout: 30_000 },
  );

  // AI bubble should get non-empty content (OpenRouter or dev fallback)
  await expect
    .poll(
      async () => {
        const aiMessages = await page
          .locator('[data-testid="ai-message"], .from-ai, [class*="ChatItem"]')
          .allTextContents();
        const body = await page.locator("body").innerText();
        return body.length > 200 && !body.includes("INTERNAL_SERVER_ERROR");
      },
      { timeout: 45_000 },
    )
    .toBeTruthy();
});
