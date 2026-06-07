import { test, expect } from "./fixtures";

const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";

test("New chat button opens a fresh empty chat", async ({ page }) => {
  await page.goto(`/${ORG_ID}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/chats/`), {
    timeout: 20_000,
  });
  await expect(page.getByTestId("chat-input")).toBeVisible({ timeout: 15_000 });

  const urlBefore = page.url();

  await page.getByTestId("sidebar-new-chat-button").click();

  await expect(page).not.toHaveURL(urlBefore, { timeout: 15_000 });

  await expect(page.getByText("How can I help you today?")).toBeVisible({
    timeout: 10_000,
  });
});
