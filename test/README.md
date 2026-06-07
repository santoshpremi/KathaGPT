# KathGPT tests

## E2E (Playwright)

Simulates a real user session: open org home, land on a chat, verify sidebar loads.

```bash
pnpm run test:e2e
```

Requires dev servers on ports 5173 (Vite) and 17890 (Rust API) — run `./start-dev.sh` or `pnpm dev`. Playwright reuses an existing server when one is already running.
