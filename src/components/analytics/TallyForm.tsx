import { useEffect } from "react";

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}
const Tally = window.Tally;

interface TallyProps {
  formId: string;
  width?: string;
  height?: string;
}

/**
 * Tally component for embedding forms
 *
 * This component loads and displays a Tally form embed using their official widget.
 * It automatically handles loading the Tally embed script and initializing the form.
 *
 * @param {string} formId - The ID of your Tally form
 * @param {string} [width="100%"] - Width of the iframe (default: "100%")
 * @param {string} [height="500px"] - Height of the iframe (default: "500px")
 *
 * @see https://tally.so/help/developer-resources#85b0ab91621742cdb600183f9c261fae
 */

export function TallyForm({
  formId,
  width = "100%",
  height = "216",
  ...rest
}: TallyProps & Record<string, string>) {
  // The code below will load the embed
  useEffect(() => {
    const widgetScriptSrc = "https://tally.so/widgets/embed.js";

    const load = () => {
      // Load Tally embeds
      if (typeof Tally !== "undefined") {
        Tally.loadEmbeds();
        return;
      }

      // Fallback if window.Tally is not available
      document
        .querySelectorAll<HTMLIFrameElement>(
          "iframe[data-tally-src]:not([src])",
        )
        .forEach((iframeEl) => {
          iframeEl.src = iframeEl.dataset.tallySrc!;
        });
    };

    // If Tally is already loaded, load the embeds
    if (typeof Tally !== "undefined") {
      load();
      return;
    }

    // If the Tally widget script is not loaded yet, load it
    if (document.querySelector(`script[src="${widgetScriptSrc}"]`) === null) {
      const script = document.createElement("script");
      script.src = widgetScriptSrc;
      script.onload = load;
      script.onerror = load;
      document.body.appendChild(script);
      return;
    }
  }, []);

  const extraProps = Object.entries(rest)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join("&");

  return (
    <div>
      <iframe
        data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&${extraProps}`}
        width={width}
        height={height}
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
      />
    </div>
  );
}
