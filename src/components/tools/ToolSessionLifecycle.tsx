import { useEffect } from "react";
import { archiveDirtyToolSessions } from "../../lib/tools/archiveToolSession";

const FLUSH_KEY = "kathgpt-tool-flush-ts";
const FLUSH_COOLDOWN_MS = 3000;

/** Archives unsaved tool work to history when the app/tab closes. */
export function ToolSessionLifecycle() {
  useEffect(() => {
    const flush = () => {
      const now = Date.now();
      const last = Number(sessionStorage.getItem(FLUSH_KEY) || 0);
      if (now - last < FLUSH_COOLDOWN_MS) return;
      sessionStorage.setItem(FLUSH_KEY, String(now));
      archiveDirtyToolSessions();
    };

    window.addEventListener("pagehide", flush);

    return () => {
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
