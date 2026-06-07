import { test, expect } from "./fixtures";

const ORG_ID = "org_cm8yflh26064xmw01zbalts9c";
const API = "http://127.0.0.1:17890/api/local";

test("deleting active chat does not show NOT_FOUND error toast", async ({
  page,
  request,
}) => {
  const chatId = `chat_delete_${Date.now()}`;
  const create = await request.post(`${API}/chats`, {
    data: { id: chatId, name: "Delete me E2E" },
  });
  expect(create.status()).toBe(201);

  const trpcToasts: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") trpcToasts.push(msg.text());
  });

  await page.goto(`/${ORG_ID}/chats/${chatId}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(new RegExp(`/${ORG_ID}/chats/`), {
    timeout: 20_000,
  });

  const chatRow = page
    .locator("#sidebar")
    .locator("li")
    .filter({ hasText: "Delete me E2E" });
  const menuButton = chatRow.locator("button").last();
  await expect(menuButton).toBeVisible({ timeout: 10_000 });

  await menuButton.click();
  await page.getByRole("menuitem", { name: /delete/i }).click();
  await page.getByRole("button", { name: /sure|confirm|delete/i }).click();

  await expect(page.getByText("Chat deleted")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("body")).not.toContainText(
    "trpcErrorCodes.NOT_FOUND",
    { timeout: 5_000 },
  );
  await expect(page.getByTestId("chat-input")).toBeVisible({ timeout: 15_000 });
});
