import { test, expect } from "./fixtures";
import { ORG_ID, API } from "./helpers";

const CODE = 'console.log("hello");';
const MARKDOWN = `\`\`\`javascript\n${CODE}\n\`\`\``;

test("code block copy button copies raw code on hover", async ({
  page,
  context,
  request,
}) => {
  const chatId = `chat_codeblock_${Date.now()}`;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.route(`**/api/local/chats/${chatId}/messages`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "msg_ai_codeblock",
          content: MARKDOWN,
          createdAt: new Date().toISOString(),
          fromAi: true,
          responseCompleted: true,
          authorId: null,
          chatId,
          generationModel: "gpt-4o-mini",
          attachmentIds: [],
          ragSources: [],
          citations: [],
          artifactVersionId: null,
          cancelled: false,
          errorCode: null,
          tokens: 10,
        },
      ]),
    });
  });

  await request.post(`${API}/chats`, {
    data: { id: chatId, name: "Code copy test" },
  });

  await page.goto(`/${ORG_ID}/chats/${chatId}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30_000 });

  await expect(page.getByTestId("code-block-copy-button")).toBeAttached({
    timeout: 15_000,
  });

  // Highlight.js can re-render the block once — click via DOM to avoid detach races.
  await page.waitForFunction(() => {
    const code = document.querySelector("pre code");
    return code?.textContent?.includes("console.log");
  });

  await page.evaluate(() => {
    document
      .querySelector<HTMLButtonElement>('[data-testid="code-block-copy-button"]')
      ?.click();
  });

  await expect(page.getByTestId("code-block-copy-button")).toHaveAttribute(
    "aria-label",
    /Copied/i,
    { timeout: 5_000 },
  );

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.trim()).toBe(CODE);

  await request.delete(`${API}/chats/${chatId}`);
});
