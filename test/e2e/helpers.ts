import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";
export const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
export const API =
  process.env.KATHAGPT_API_BASE ?? "http://127.0.0.1:17890/api/local";

/** Land on the chats shell without relying on org-home redirect timing. */
export async function gotoChatsHome(page: Page) {
  await page.goto(`/${ORG_ID}/chats`, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30_000 });
}

/** Chats only appear in list/search after at least one message exists. The first user message becomes the chat title. */
export async function createChatWithMessage(
  request: APIRequestContext,
  options: { id: string; name: string; content: string },
) {
  const create = await request.post(`${API}/chats`, {
    data: { id: options.id, name: options.name },
  });
  expect(create.status()).toBe(201);

  const stream = await request.post(`${API}/chats/${options.id}/messages/stream`, {
    data: { content: options.content },
    headers: { Accept: "text/event-stream" },
  });
  expect(stream.ok()).toBeTruthy();
  await stream.text();
}

export async function mockStoredOpenRouterKey(page: Page) {
  await page.route("**/api/local/provider-keys/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "openrouter",
          configured: true,
          source: "stored",
          maskedKey: "sk-or-v1••••abcd",
        },
        { id: "openai", configured: false, source: "none" },
        { id: "anthropic", configured: false, source: "none" },
        { id: "gemini", configured: false, source: "none" },
        { id: "perplexity", configured: false, source: "none" },
      ]),
    });
  });
}
