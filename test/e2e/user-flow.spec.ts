import { test, expect } from "./fixtures";
import { BASE_URL, ORG_ID } from "./helpers";

test.describe("KathaGPT user flow", () => {
  test("home redirects to a chat without error screen", async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (text.includes("TRPC error")) return;
      if (text.includes("Schema validation failed")) return;
      if (text.startsWith("Warning:")) return;
      criticalErrors.push(text);
    });

    await page.goto(`${BASE_URL}/${ORG_ID}`, { waitUntil: "domcontentloaded" });

    await expect
      .poll(() => page.url(), { timeout: 30_000 })
      .toMatch(new RegExp(`/${ORG_ID}/chats/`));

    await expect(page.locator("body")).not.toContainText("errorDisplay.title");
    await expect(page.locator("body")).not.toContainText("errorDisplay.helpText");
    await expect(page.locator("body")).not.toContainText(
      "Expected object, received string",
    );

    const sidebar = page.getByTestId("sidebar");
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await expect(page.locator("body")).toContainText("New chat");
    await expect(page.locator("body")).not.toContainText("sidebar.allChats");
    const chatInput = page.getByTestId("chat-input");
    await expect(chatInput).toBeVisible({ timeout: 15_000 });

    const chatPanel = page.locator(".relative.flex.h-full.w-full");
    const box = await chatPanel.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(500);

    expect(criticalErrors).toEqual([]);
  });

  test("Rust API proxy serves user endpoint", async ({ request }) => {
    const health = await request.get(`${BASE_URL}/api/local/health`);
    expect(health.ok()).toBeTruthy();

    const user = await request.get(`${BASE_URL}/api/local/user/me`);
    expect(user.ok()).toBeTruthy();
    const userBody = await user.json();
    expect(userBody.email).toBeTruthy();
  });
});
