import { test, expect } from "./fixtures";
import { gotoChatsHome } from "./helpers";

test("New chat button opens a fresh empty chat", async ({ page }) => {
  await gotoChatsHome(page);
  await expect(page.getByTestId("chat-input")).toBeVisible({ timeout: 15_000 });

  const urlBefore = page.url();

  await page.getByTestId("sidebar-new-chat-button").click();

  await expect(page).not.toHaveURL(urlBefore, { timeout: 15_000 });

  await expect(page.getByText("How can I help you today?")).toBeVisible({
    timeout: 10_000,
  });
});
