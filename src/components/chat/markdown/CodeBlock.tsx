import { Check, ContentCopy } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/joy";
import type { ComponentProps } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useTranslation } from "../../../lib/i18n";

import { Mermaid } from "./Mermaid";

const COPIED_FEEDBACK_MS = 1500;

function getCodeText(container: HTMLElement | null): string {
  if (!container) return "";
  const code = container.querySelector("code");
  return code?.textContent ?? container.innerText ?? "";
}

/**
 * Renders an auto-highlighted code block with a copy button or a mermaid diagram.
 */
export function CodeBlock(props: ComponentProps<"pre">) {
  const { t } = useTranslation();
  const ref = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");

  const refText = ref.current?.innerText;

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refText]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyCode = useCallback(async () => {
    const text = getCodeText(ref.current);
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
        setCopied(true);
      } catch {
        // Clipboard unavailable — no inline feedback
      }
    }
  }, []);

  if (mermaidCode.length > 0) {
    return <Mermaid code={mermaidCode} key={mermaidCode} />;
  }

  const copyLabel = copied ? t("copiedSuccessfully") : t("copyCode");

  return (
    <pre className="group/code relative">
      <div className="absolute right-0 top-0 p-2 opacity-0 transition-opacity group-hover/code:opacity-100">
        <Tooltip title={copyLabel}>
          <IconButton
            size="sm"
            data-testid="code-block-copy-button"
            aria-label={copyLabel}
            onClick={() => void copyCode()}
          >
            {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      </div>
      <span ref={ref}>{props.children}</span>
    </pre>
  );
}
