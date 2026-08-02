import { test, expect } from "@playwright/test";

const API = process.env.KATHAGPT_API_BASE ?? "http://127.0.0.1:17890/api/local";

async function waitForHealthyApi(request: import("@playwright/test").APIRequestContext) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await request.get(`${API}/health`);
      if (health.ok()) return;
    } catch {
      // API may restart while the embedder loads.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Rust API did not become healthy in time");
}

async function uploadDocument(
  request: import("@playwright/test").APIRequestContext,
  payload: { filename: string; data: string; mimeType: string },
) {
  await waitForHealthyApi(request);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const upload = await request.post(`${API}/documents/upload`, { data: payload });
      if (upload.ok()) return upload;
    } catch {
      await waitForHealthyApi(request);
    }
  }
  return request.post(`${API}/documents/upload`, { data: payload });
}

test.describe("Rust local API", () => {
  test.beforeAll(async ({ request }) => {
    try {
      const health = await request.get(`${API}/health`);
      test.skip(!health.ok(), "Rust API not running — start with: pnpm dev");
    } catch {
      test.skip(true, "Rust API not running — start with: pnpm dev");
    }
  });

  test("health returns sqlite ok", async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("sqlite");
  });

  test("user me returns local profile", async ({ request }) => {
    const res = await request.get(`${API}/user/me`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.firstName).toBe("John");
    expect(body.email).toMatch(/@kathagpt\.local$/);
  });

  test("provider keys status lists all providers", async ({ request }) => {
    const res = await request.get(`${API}/provider-keys/status`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveLength(5);
    expect(body.map((s: { id: string }) => s.id)).toContain("openrouter");
  });

  test("model config returns enabled and available models", async ({
    request,
  }) => {
    const enabled = await request.get(`${API}/model-config/enabled`);
    expect(enabled.ok()).toBeTruthy();
    const enabledBody = await enabled.json();
    expect(enabledBody.length).toBeGreaterThan(0);
    expect(enabledBody).toContain("gpt-4o-mini");

    const available = await request.get(`${API}/model-config/available`);
    expect(available.ok()).toBeTruthy();
    const availableBody = await available.json();

    for (const model of availableBody) {
      expect(enabledBody).toContain(model);
    }
  });

  test("workflows lists demo workflow", async ({ request }) => {
    const res = await request.get(`${API}/workflows`);
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
    const imp = await request.post(`${API}/data/import`, {
      data: snapshot,
    });
    expect(imp.ok()).toBeTruthy();

    const chat = await request.get(`${API}/chats/${chatId}`);
    expect(chat.ok()).toBeTruthy();
    const body = await chat.json();
    expect(body.id).toBe(chatId);
    expect(body.name).toBe("Imported chat");

    await request.delete(`${API}/chats/${chatId}`);
  });

  test("local models hardware profile returns RAM budget", async ({
    request,
  }) => {
    const res = await request.get(`${API}/local-models/hardware`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.totalRamGb).toBeGreaterThan(0);
    expect(body.effectiveRamGb).toBeGreaterThan(0);
    expect(body.effectiveRamGb).toBeLessThanOrEqual(body.totalRamGb);
    expect(["apple_metal", "cuda", "cpu"]).toContain(body.gpuHint);
    if (body.recommendedModel) {
      expect(typeof body.recommendedQuant).toBe("string");
    }
  });

  test("local models catalog marks compatibility and quant", async ({
    request,
  }) => {
    const res = await request.get(`${API}/local-models/catalog`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toMatchObject({
      compatible: expect.any(Boolean),
      recommended: expect.any(Boolean),
      minRamGb: expect.any(Number),
      quant: expect.any(String),
    });
    expect(body.some((m: { recommended: boolean }) => m.recommended)).toBeTruthy();
  });

  test("data export returns snapshot", async ({ request }) => {
    const res = await request.get(`${API}/data/export`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.version).toBe(1);
    expect(body.chats).toBeDefined();
  });

  test("chat search filters by name and message content", async ({
    request,
  }) => {
    const stamp = Date.now();
    const chatA = `chat_search_a_${stamp}`;
    const chatB = `chat_search_b_${stamp}`;

    await request.post(`${API}/chats`, {
      data: { id: chatA, name: "Project planning notes" },
    });
    await request.post(`${API}/chats`, {
      data: { id: chatB, name: "Weekly standup" },
    });

    const streamA = await request.post(`${API}/chats/${chatA}/messages/stream`, {
      data: { content: "Discussed database migration timeline" },
      headers: { Accept: "text/event-stream" },
    });
    expect(streamA.ok()).toBeTruthy();
    await streamA.text();

    const streamB = await request.post(`${API}/chats/${chatB}/messages/stream`, {
      data: { content: "Team updates only" },
      headers: { Accept: "text/event-stream" },
    });
    expect(streamB.ok()).toBeTruthy();
    await streamB.text();

    const byName = await request.get(`${API}/chats?q=planning`);
    expect(byName.ok()).toBeTruthy();
    const nameResults = await byName.json();
    expect(nameResults.some((c: { id: string }) => c.id === chatA)).toBeTruthy();
    expect(nameResults.some((c: { id: string }) => c.id === chatB)).toBeFalsy();

    const byContent = await request.get(`${API}/chats?q=migration`);
    expect(byContent.ok()).toBeTruthy();
    const contentResults = await byContent.json();
    expect(
      contentResults.some((c: { id: string }) => c.id === chatA),
    ).toBeTruthy();

    await request.delete(`${API}/chats/${chatA}`);
    await request.delete(`${API}/chats/${chatB}`);
  });

  test("message stream returns SSE init, delta, and done", async ({
    request,
  }) => {
    const userContent = `E2E stream ping ${Date.now()}`;
    const chatId = `chat_e2e_${Date.now()}`;
    const create = await request.post(`${API}/chats`, {
      data: { id: chatId, name: "E2E stream test" },
    });
    expect(create.status()).toBe(201);

    const stream = await request.post(
      `${API}/chats/${chatId}/messages/stream`,
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

    const messages = await request.get(`${API}/chats/${chatId}/messages`);
    expect(messages.ok()).toBeTruthy();
    const msgs = await messages.json();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].fromAi).toBe(false);
    expect(msgs[0].content).toBe(userContent);
    expect(msgs[0].tokens).toBeGreaterThan(0);
    expect(msgs[1].fromAi).toBe(true);
    expect(msgs[1].content?.length).toBeGreaterThan(0);
    expect(msgs[1].tokens).toBeGreaterThan(0);

    await request.delete(`${API}/chats/${chatId}`);
  });

  test("document upload indexes chunks for RAG", async ({ request }) => {
    test.setTimeout(120_000);
    const docText =
      "KathaGPT RAG test document. Q3 revenue increased by 15 percent year over year.";
    const upload = await uploadDocument(request, {
      filename: "rag-test.txt",
      data: Buffer.from(docText).toString("base64"),
      mimeType: "text/plain",
    });
    expect(upload.ok()).toBeTruthy();
    const doc = await upload.json();
    expect(doc.id).toMatch(/^doc_/);

    const collections = await request.get(`${API}/rag/collections`);
    expect(collections.ok()).toBeTruthy();
    const list = await collections.json();
    expect(list.some((c: { id: string }) => c.id === doc.id)).toBeTruthy();

    const status = await request.get(`${API}/rag/status`);
    expect(status.ok()).toBeTruthy();
    const statusBody = await status.json();
    expect(statusBody.totalChunks).toBeGreaterThan(0);
    expect(statusBody.embedder).toMatch(/fastembed|hash_v1|hash/);

    const reindex = await request.post(`${API}/documents/${doc.id}/reindex`);
    expect(reindex.ok()).toBeTruthy();
    const reindexBody = await reindex.json();
    expect(reindexBody.chunksIndexed).toBeGreaterThan(0);

    const del = await request.delete(`${API}/documents/${doc.id}`);
    expect(del.ok()).toBeTruthy();
    const afterDelete = await request.get(`${API}/rag/collections`);
    const afterList = await afterDelete.json();
    expect(afterList.some((c: { id: string }) => c.id === doc.id)).toBeFalsy();
  });

  test("message stream with attachment returns RAG citations in init", async ({
    request,
  }) => {
    test.setTimeout(120_000);
    const docText =
      "Secret project codename Aurora. Budget allocation is 2.5 million dollars for 2026.";
    const upload = await uploadDocument(request, {
      filename: "aurora-brief.txt",
      data: Buffer.from(docText).toString("base64"),
      mimeType: "text/plain",
    });
    expect(upload.ok()).toBeTruthy();
    const doc = await upload.json();

    const chatId = `chat_rag_${Date.now()}`;
    const create = await request.post(`${API}/chats`, {
      data: { id: chatId, name: "RAG test" },
    });
    expect(create.status()).toBe(201);

    const stream = await request.post(
      `${API}/chats/${chatId}/messages/stream`,
      {
        data: {
          content: "What is the project codename and budget?",
          attachmentIds: [doc.id],
        },
        headers: { Accept: "text/event-stream" },
      },
    );
    expect(stream.ok()).toBeTruthy();
    const sse = await stream.text();
    expect(sse).toContain("event: init");
    expect(sse).toMatch(/ragCitations|ragSources|Aurora|aurora-brief/);

    const messages = await request.get(`${API}/chats/${chatId}/messages`);
    expect(messages.ok()).toBeTruthy();
    const msgs = await messages.json();
    const aiMsg = msgs.find((m: { fromAi: boolean }) => m.fromAi);
    const hasRagSources =
      Array.isArray(aiMsg?.ragSources) && aiMsg.ragSources.length > 0;
    const mentionsAurora = aiMsg?.content?.toLowerCase().includes("aurora");
    expect(hasRagSources || mentionsAurora || sse.includes("Aurora")).toBeTruthy();

    await request.delete(`${API}/chats/${chatId}`);
  });
});
