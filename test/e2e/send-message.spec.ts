import { test, expect } from "./fixtures";
import { gotoChatsHome } from "./helpers";

test("sending Hi returns an AI response", async ({ page }) => {
  const trpcErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") trpcErrors.push(msg.text());
  });

  await gotoChatsHome(page);

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

  // Dev fallback or provider response — wait for a non-empty AI bubble.
  await expect
    .poll(
      async () => {
        const aiMessages = page.locator(".aiMessage");
        if ((await aiMessages.count()) === 0) return false;
        const text = await aiMessages.first().innerText();
        const body = await page.locator("body").innerText();
        return (
          text.trim().length > 10 &&
          !body.includes("INTERNAL_SERVER_ERROR")
        );
      },
      { timeout: 45_000 },
    )
    .toBeTruthy();
});
