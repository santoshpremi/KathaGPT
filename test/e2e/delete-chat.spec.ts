import { test, expect } from "./fixtures";
import { createChatWithMessage, gotoChatsHome, ORG_ID, API } from "./helpers";

test("deleting active chat does not show NOT_FOUND error toast", async ({
  page,
  request,
}) => {
  const chatId = `chat_delete_${Date.now()}`;
  await createChatWithMessage(request, {
    id: chatId,
    name: "Delete me E2E",
    content: "Delete me E2E",
  });

  const trpcToasts: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") trpcToasts.push(msg.text());
  });

  await page.goto(`/${ORG_ID}/chats/${chatId}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30_000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("sidebar")).toBeVisible({ timeout: 30_000 });

  const chatRow = page
    .locator("#sidebar")
    .locator("li")
    .filter({ hasText: "Delete me E2E" });
  await expect(chatRow).toBeVisible({ timeout: 15_000 });
  await chatRow.hover();
  const menuButton = chatRow.locator("button").last();
  await menuButton.click({ force: true });
  await page.getByRole("menuitem", { name: /delete/i }).click();
  await page.getByRole("button", { name: /sure|confirm|delete/i }).click();

  await expect(page.getByText("Chat deleted")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).not.toContainText(
    "trpcErrorCodes.NOT_FOUND",
    { timeout: 5_000 },
  );
  await expect(page.getByTestId("chat-input")).toBeVisible({ timeout: 15_000 });

  await request.delete(`${API}/chats/${chatId}`);
});
