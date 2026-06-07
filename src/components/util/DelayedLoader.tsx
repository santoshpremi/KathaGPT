import { CircularProgress } from "@mui/joy";
import { useEffect, useState } from "react";

// This component will fill the space of the parent component and display a loading spinner if it exists for a certain amount of time.
export function DelayedLoader({ delay = 300 }: { delay?: number }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoader(true);
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {showLoader && <CircularProgress />}
    </div>
  );
}
