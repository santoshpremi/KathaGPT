import { useState, useEffect } from "react";

export function useSmoothTypingText(text: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const totalLength = text.length;
        const delta = totalLength - p;
        const stepSpeed = Math.max(1, Math.floor(delta / 40));
        return Math.min(totalLength, p + stepSpeed);
      });
    }, 1);
    return () => clearInterval(interval);
  }, [text]);

  return text.substring(0, progress);
}
