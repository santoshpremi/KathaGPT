import { test, expect, type Page } from "./fixtures";
import { gotoChatsHome, ORG_ID } from "./helpers";

const MOCK_MODEL = {
  name: "llama-test-e2e",
  displayName: "Llama Test E2E",
  description: "Compact mock model for Playwright e2e coverage.",
  tags: ["chat", "fast"],
  parameterSize: "3B",
  sizeBytes: 2_147_483_648,
  minRamGb: 8,
  installed: false,
  downloading: false,
  compatible: true,
  recommended: true,
  quant: "Q4_K_M",
};

const MOCK_HARDWARE = {
  totalRamGb: 16,
  effectiveRamGb: 14,
  platform: "macos",
  arch: "aarch64",
  gpuHint: "apple_metal",
  recommendedModel: MOCK_MODEL.name,
  recommendedQuant: "Q4_K_M",
};

type MockProgress = {
  modelName: string;
  phase: string;
  bytesDone: number;
  bytesTotal: number;
  fraction: number;
  done: boolean;
  error?: string;
};

function sseBody(progress: MockProgress[]): string {
  return `data: ${JSON.stringify(progress)}\n\n`;
}

async function installLocalModelMocks(
  page: Page,
  options?: {
    progress?: MockProgress[];
    downloadError?: string;
  },
) {
  let progress = options?.progress ?? [];
  const catalog = [{ ...MOCK_MODEL }];

  await page.route("**/api/local/local-models/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/.*\/api\/local/, "");

    if (path === "/local-models/status") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ready: false,
          binaryInstalled: false,
          loadedModel: null,
        }),
      });
      return;
    }

    if (path === "/local-models/hardware") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_HARDWARE),
      });
      return;
    }

    if (path === "/local-models/installed") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    if (path.startsWith("/local-models/catalog")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(catalog),
      });
      return;
    }

    if (path === "/local-models/download" && route.request().method() === "POST") {
      if (options?.downloadError) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: options.downloadError }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    if (path === "/local-models/progress") {
      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: sseBody(progress),
      });
      return;
    }

    await route.continue();
  });

  return {
    setProgress(next: MockProgress[]) {
      progress = next;
    },
    setCatalogInstalled(installed: boolean) {
      catalog[0] = { ...MOCK_MODEL, installed };
    },
  };
}

async function openLocalModelsModal(page: Page) {
  await gotoChatsHome(page);

  const profileButton = page.getByRole("button", { name: /John Doe|Local User/ });
  await expect(profileButton).toBeVisible({ timeout: 10_000 });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await profileButton.click();
    const addLocalModel = page.getByRole("menuitem", {
      name: "Add Local Model",
    });
    try {
      await expect(addLocalModel).toBeVisible({ timeout: 5_000 });
      await addLocalModel.click({ timeout: 5_000 });
      break;
    } catch {
      if (attempt === 2) throw new Error("Could not open Add Local Model menu");
    }
  }

  await expect(page.getByText("Add Local Model", { exact: true })).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("Local model download flow (mocked)", () => {
  test("catalog renders model name, size, RAM badge, and quant", async ({
    page,
  }) => {
    await installLocalModelMocks(page);
    await openLocalModelsModal(page);

    await expect(page.getByText("Llama Test E2E", { exact: true })).toBeVisible();
    await expect(page.getByText("Q4_K_M", { exact: true })).toBeVisible();
    await expect(page.getByText("3B", { exact: true })).toBeVisible();
    await expect(page.getByText("8GB RAM", { exact: true })).toBeVisible();
    await expect(page.getByText("Best for your device")).toBeVisible();
    await expect(page.getByText(/2\.00 GB/)).toBeVisible();
    await expect(page.getByText("AVAILABLE MODELS")).toBeVisible();
  });

  test("download progress bar updates from mocked SSE events", async ({
    page,
  }) => {
    await installLocalModelMocks(page, {
      progress: [
        {
          modelName: MOCK_MODEL.name,
          phase: "downloadingModel",
          bytesDone: 1_073_741_824,
          bytesTotal: 2_147_483_648,
          fraction: 0.5,
          done: false,
        },
      ],
    });
    await openLocalModelsModal(page);

    await expect(
      page.locator('[role="progressbar"][aria-valuenow="50"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Downloading/i)).toBeVisible();
    await expect(page.getByText(/1\.00 GB \/ 2\.00 GB/)).toBeVisible();
  });

  test("error state shows message from mocked SSE progress", async ({
    page,
  }) => {
    await installLocalModelMocks(page, {
      progress: [
        {
          modelName: MOCK_MODEL.name,
          phase: "downloadingModel",
          bytesDone: 0,
          bytesTotal: 2_147_483_648,
          fraction: 0,
          done: false,
          error: "Mock download failed: disk full",
        },
      ],
    });
    await openLocalModelsModal(page);

    await expect(
      page.getByText("Mock download failed: disk full"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: "Retry", exact: true }),
    ).toBeVisible();
  });
});
