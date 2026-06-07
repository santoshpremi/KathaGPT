import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useArtifact } from "./ArtifactProvider";
import TextHighlightOptions from "./TextHighlightOptions";
import {
  type HighlightInfo,
  MarkdownRenderer,
} from "../chat/markdown/MarkdownRenderer";

interface ArtifactTextEditor {
  content: string;
  onScroll?: (scrollY: number) => void;
}

export default function ArtifactTextEditor({
  content,
  onScroll,
}: ArtifactTextEditor) {
  const [highlightData, setHighlightData] = useState<HighlightInfo | null>(
    null,
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const { createNewVersion } = useArtifact();

  const handleImprove = (improvement: string) => {
    if (!highlightData) return;
    const { text, context } = highlightData;
    setHighlightData(null);

    createNewVersion({
      highlightedText: text,
      feedback: improvement,
      context,
    });
  };

  const calculatePosition = ({ x, y }: { x: number; y: number }) => {
    if (!parentRef.current) return { left: x, top: y };

    const { innerWidth: width, innerHeight: height } = window;
    const containerWidth = 480;
    const containerHeight = 120;

    const topPosition = Math.min(Math.max(y, 0), height - containerHeight) + 20;
    // If container would overflow on the right
    if (x + containerWidth > width) {
      return {
        right: 10,
        top: topPosition,
      };
    }

    return {
      left: x,
      top: topPosition,
    };
  };

  const handleScroll = (scrollY: number) => {
    if (onScroll) onScroll(scrollY);
    setHighlightData(null);
  };

  return (
    <div
      ref={parentRef}
      onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
      className="relative ml-4 overflow-y-auto px-2 pb-14 pt-4"
    >
      <MarkdownRenderer content={content} onHighlight={setHighlightData} />
      <AnimatePresence>
        {highlightData && (
          <TextHighlightOptions
            style={calculatePosition({
              x: highlightData.x,
              y: highlightData.y,
            })}
            onImprove={handleImprove}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
