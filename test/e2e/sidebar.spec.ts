import { test, expect } from "./fixtures";

const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";
const API = process.env.KATHAGPT_API_BASE ?? "http://127.0.0.1:17890/api/local";

test.describe("Sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${ORG_ID}`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/chats/`), {
      timeout: 20_000,
    });
  });

  test("prompt library opens prompt library page", async ({ page }) => {
    await page.getByRole("link", { name: "Prompt library" }).click();
    await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/prompt-library`), {
      timeout: 10_000,
    });
    await expect(
      page.getByText("10 Best Prompt Practices", { exact: true }).first(),
    ).toBeVisible();
  });

  test("all chats opens chat list", async ({ page }) => {
    await page.getByTestId("all-chats-button").click();
    await expect(page).toHaveURL(`/${ORG_ID}/chats`, { timeout: 10_000 });
  });

  test("research assistant opens dedicated tool page", async ({ page }) => {
    await page.getByTestId("research-assistant-sidebar-button").click();
    await expect(page).toHaveURL(
      new RegExp(`/${ORG_ID}/tools/researchAssistant`),
      { timeout: 15_000 },
    );
    await expect(page.getByTestId("research-query-input")).toBeVisible();
    await expect(
      page.getByPlaceholder("What would you like to research?"),
    ).toBeVisible();
  });

  test("help and feedback opens modal", async ({ page }) => {
    await page.getByRole("button", { name: "Help & feedback" }).click();
    await expect(page.getByText("Help center")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("chat search filters sidebar results", async ({ page, request }) => {
    const stamp = Date.now();
    const chatId = `chat_sidebar_search_${stamp}`;
    const uniqueToken = `sidebarfind${stamp}`;

    await request.post(`${API}/chats`, {
      data: { id: chatId, name: `Searchable ${uniqueToken} chat` },
    });
    const stream = await request.post(`${API}/chats/${chatId}/messages/stream`, {
      data: { content: `Hello from ${uniqueToken}` },
      headers: { Accept: "text/event-stream" },
    });
    expect(stream.ok()).toBeTruthy();
    await stream.text();

    const searchInput = page.getByTestId("chat-search-input");
    await searchInput.fill(uniqueToken);
    await expect(page.getByText(uniqueToken, { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });

    await request.delete(`${API}/chats/${chatId}`);
  });

  test("workflow create button opens modal", async ({ page }) => {
    await page.getByTestId("create-workflow-button").click();
    await expect(
      page.getByText("Create workflow with AI", { exact: false }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
