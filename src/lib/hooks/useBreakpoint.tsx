import { useEffect, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

function getBreakpoints() {
  const config = resolveConfig(tailwindConfig);
  const rawBreakpoints = config.theme?.screens;
  if (!rawBreakpoints) return;

  const breakpoints: Breakpoints = Object.entries(rawBreakpoints).reduce(
    (acc, [key, value]) => {
      const _value = (value as string).replace("px", "");
      acc[key as Breakpoint] = parseInt(_value);
      return acc;
    },
    {} as Breakpoints,
  );

  return breakpoints;
}

function useBreakingPoint(breakpoint: Breakpoint): boolean {
  const breakpoints = getBreakpoints();
  if (!breakpoints) throw new Error("Breakpoints are not defined.");

  const width = breakpoints[breakpoint];

  const [triggered, setTriggered] = useState<boolean>(
    width >= window.innerWidth,
  );

  useEffect(() => {
    const handleResize = () => {
      setTriggered(width >= window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, breakpoint]);

  return triggered;
}

export default useBreakingPoint;
