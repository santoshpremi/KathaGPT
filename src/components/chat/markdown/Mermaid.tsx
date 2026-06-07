import { Alert } from "@mui/joy";
import React, { useEffect, useRef, useState } from "react";

/**
 * Renders a mermaid diagram.
 */
export function Mermaid(props: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!props.code || !ref.current) return;

    let cancelled = false;
    void import("mermaid").then(({ default: mermaid }) => {
      if (cancelled || !ref.current) return;
      mermaid
        .run({ nodes: [ref.current] })
        .catch((e: Error) => {
          if (!cancelled) {
            setHasError(true);
            console.error("[Mermaid] ", e.message);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    // open new window
    window.open(url, "_blank");
  }

  if (hasError) {
    return <Alert color="danger">Error rendering diagram.</Alert>;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}
