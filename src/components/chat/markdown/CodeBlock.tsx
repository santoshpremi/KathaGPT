import { ContentCopy } from "@mui/icons-material";
import { IconButton } from "@mui/joy";
import type { ComponentProps } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useCopySafe } from "../../../lib/hooks/useCopySafe";

import { Mermaid } from "./Mermaid";

/**
 * Renders an auto-highlighted code block with a copy button or a mermaid diagram.
 */
export function CodeBlock(props: ComponentProps<"pre">) {
  const copySafe = useCopySafe();
  const ref = useRef<HTMLSpanElement>(null);
  const refText = ref.current?.innerText;

  const [mermaidCode, setMermaidCode] = useState("");

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

  if (mermaidCode.length > 0) {
    return <Mermaid code={mermaidCode} key={mermaidCode} />;
  }

  return (
    <pre className="group/code relative">
      <div className="absolute right-0 top-0 p-2 opacity-0 transition-all group-hover/code:opacity-100">
        <IconButton
          size="sm"
          onClick={() => {
            copySafe(ref.current?.innerText ?? "");
          }}
        >
          <ContentCopy />
        </IconButton>
      </div>
      <span ref={ref}>{props.children}</span>
    </pre>
  );
}
