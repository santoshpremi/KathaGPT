#!/usr/bin/env node
/**
 * Validates Open Graph + Twitter Card tags for X, LinkedIn, and Facebook.
 * LinkedIn reads og:* tags only (Post Inspector: linkedin.com/post-inspector).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(root, "index.html");
const html = readFileSync(indexPath, "utf8");

function metaContent(pattern) {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

const ogImage =
  metaContent(/property="og:image"\s+content="([^"]+)"/) ??
  metaContent(/content="([^"]+)"\s+property="og:image"/);

const checks = [
  {
    platform: "LinkedIn",
    key: "og:title",
    value: metaContent(/property="og:title"\s+content="([^"]+)"/),
    hint: "https://www.linkedin.com/post-inspector/",
  },
  {
    platform: "LinkedIn",
    key: "og:description",
    value: metaContent(/property="og:description"\s+content="([^"]+)"/),
  },
  {
    platform: "LinkedIn",
    key: "og:url",
    value: metaContent(/property="og:url"\s+content="([^"]+)"/),
  },
  {
    platform: "LinkedIn",
    key: "og:image",
    value: ogImage,
  },
  {
    platform: "LinkedIn",
    key: "og:image:width",
    value: metaContent(/property="og:image:width"\s+content="([^"]+)"/),
  },
  {
    platform: "LinkedIn",
    key: "og:image:height",
    value: metaContent(/property="og:image:height"\s+content="([^"]+)"/),
  },
  {
    platform: "X (Twitter)",
    key: "twitter:card",
    value: metaContent(/name="twitter:card"\s+content="([^"]+)"/),
    hint: "https://cards-dev.x.com/validator",
  },
  {
    platform: "X (Twitter)",
    key: "twitter:image",
    value: metaContent(/name="twitter:image"\s+content="([^"]+)"/),
  },
  {
    platform: "Facebook",
    key: "og:type",
    value: metaContent(/property="og:type"\s+content="([^"]+)"/),
    hint: "https://developers.facebook.com/tools/debug/",
  },
];

let failed = 0;

for (const check of checks) {
  if (!check.value) {
    console.error(`✗ [${check.platform}] missing ${check.key}`);
    failed += 1;
    continue;
  }
  console.log(`✓ [${check.platform}] ${check.key}`);
}

if (ogImage?.includes("kathagpt-social.jpg")) {
  const localImage = join(root, "public/og/kathagpt-social.jpg");
  if (existsSync(localImage)) {
    console.log("✓ [LinkedIn] og:image file exists locally (public/og/kathagpt-social.jpg)");
  } else {
    console.error("✗ [LinkedIn] og:image file missing at public/og/kathagpt-social.jpg");
    failed += 1;
  }
}

const width = Number(metaContent(/property="og:image:width"\s+content="([^"]+)"/));
const height = Number(metaContent(/property="og:image:height"\s+content="([^"]+)"/));
if (width >= 1200 && height >= 627) {
  console.log(`✓ [LinkedIn] image size ${width}×${height} meets 1200×627 minimum`);
} else {
  console.error(`✗ [LinkedIn] image size ${width}×${height} — use at least 1200×627`);
  failed += 1;
}

console.log("\nRefresh caches after deploy:");
console.log("  LinkedIn → https://www.linkedin.com/post-inspector/");
console.log("  X        → https://cards-dev.x.com/validator");
console.log("  Facebook → https://developers.facebook.com/tools/debug/");

if (failed > 0) {
  process.exit(1);
}

console.log("\nAll social meta checks passed.");
