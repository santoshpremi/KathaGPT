import { test, expect } from "@playwright/test";

test.describe("Rust local API", () => {
  test.beforeAll(async ({ request }) => {
    try {
      const health = await request.get(
        "http://127.0.0.1:17890/api/local/health",
      );
      test.skip(
        !health.ok(),
        "Rust API not running — start with: pnpm dev",
      );
    } catch {
      test.skip(true, "Rust API not running — start with: pnpm dev");
    }
  });

  test("health returns sqlite ok", async ({ request }) => {
    const res = await request.get("http://127.0.0.1:17890/api/local/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("sqlite");
  });

  test("user me returns local profile", async ({ request }) => {
    const res = await request.get("http://127.0.0.1:17890/api/local/user/me");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.firstName).toBe("John");
    expect(body.email).toMatch(/@kathagpt\.local$/);
  });

  test("provider keys status lists all providers", async ({ request }) => {
    const res = await request.get(
      "http://127.0.0.1:17890/api/local/provider-keys/status",
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveLength(5);
    expect(body.map((s: { id: string }) => s.id)).toContain("openrouter");
  });

  test("model config returns enabled and available models", async ({
    request,
  }) => {
    const enabled = await request.get(
      "http://127.0.0.1:17890/api/local/model-config/enabled",
    );
    expect(enabled.ok()).toBeTruthy();
    const enabledBody = await enabled.json();
    expect(enabledBody.length).toBeGreaterThan(0);
    expect(enabledBody).toContain("gpt-4o-mini");

    const available = await request.get(
      "http://127.0.0.1:17890/api/local/model-config/available",
    );
    expect(available.ok()).toBeTruthy();
    const availableBody = await available.json();
    const keys = await request.get(
      "http://127.0.0.1:17890/api/local/provider-keys/status",
    );
    expect(keys.ok()).toBeTruthy();
    const keyStatus: { source: string }[] = await keys.json();
    const hasStoredKey = keyStatus.some((s) => s.source === "stored");
    for (const model of availableBody) {
      expect(enabledBody).toContain(model);
    }
    if (!hasStoredKey) {
      expect(availableBody).toEqual([]);
    } else {
      expect(availableBody.length).toBeGreaterThan(0);
    }
  });

  test("workflows lists demo workflow", async ({ request }) => {
    const res = await request.get("http://127.0.0.1:17890/api/local/workflows");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body.some((w: { id: string }) => w.id === "demo")).toBeTruthy();
  });

  test("data import restores chats", async ({ request }) => {
    const chatId = `chat_import_${Date.now()}`;
    const snapshot = {
      version: 1,
      chats: [
        {
          id: chatId,
          name: "Imported chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      messages: [],
      workflows: [],
    };
    const imp = await request.post("http://127.0.0.1:17890/api/local/data/import", {
      data: snapshot,
    });
    expect(imp.ok()).toBeTruthy();
    const chats = await request.get("http://127.0.0.1:17890/api/local/chats");
    const list = await chats.json();
    expect(list.some((c: { id: string }) => c.id === chatId)).toBeTruthy();
  });

  test("data export returns snapshot", async ({ request }) => {
    const res = await request.get("http://127.0.0.1:17890/api/local/data/export");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.version).toBe(1);
    expect(body.chats).toBeDefined();
  });

  test("message stream returns SSE init, delta, and done", async ({ request }) => {
    const userContent = `E2E stream ping ${Date.now()}`;
    const chatId = `chat_e2e_${Date.now()}`;
    const create = await request.post("http://127.0.0.1:17890/api/local/chats", {
      data: { id: chatId, name: "E2E stream test" },
    });
    expect(create.status()).toBe(201);

    const stream = await request.post(
      `http://127.0.0.1:17890/api/local/chats/${chatId}/messages/stream`,
      {
        data: { content: userContent },
        headers: { Accept: "text/event-stream" },
      },
    );
    expect(stream.ok()).toBeTruthy();
    const sse = await stream.text();
    expect(sse).toContain("event: init");
    expect(sse).toContain("event: delta");
    expect(sse).toContain("event: done");

    const doneMatch = sse.match(/event: done\s+data: (\{.*\})/);
    expect(doneMatch).not.toBeNull();
    const donePayload = JSON.parse(doneMatch![1]!) as { content?: string };
    expect(donePayload.content?.length).toBeGreaterThan(0);

    const messages = await request.get(
      `http://127.0.0.1:17890/api/local/chats/${chatId}/messages`,
    );
    expect(messages.ok()).toBeTruthy();
    const msgs = await messages.json();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].fromAi).toBe(false);
    expect(msgs[0].content).toBe(userContent);
    expect(msgs[1].fromAi).toBe(true);
    expect(msgs[1].content?.length).toBeGreaterThan(0);
  });
});
