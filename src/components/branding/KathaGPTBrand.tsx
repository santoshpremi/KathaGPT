import type { ComponentProps } from "react";
import logoMark from "../../assets/logo.svg";
import { cn } from "../../lib/cn";

type KathaGPTBrandProps = {
  compact?: boolean;
  className?: string;
  markClassName?: string;
  nameClassName?: string;
} & ComponentProps<"div">;

export function KathaGPTBrand({
  compact = false,
  className,
  markClassName,
  nameClassName,
  ...props
}: KathaGPTBrandProps) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2.5", className)}
      {...props}
    >
      <img
        src={logoMark}
        alt=""
        aria-hidden
        className={cn("h-8 w-8 shrink-0", markClassName)}
      />
      {!compact && (
        <span
          className={cn(
            "truncate bg-gradient-to-r from-indigo-950 via-cyan-700 to-emerald-700 bg-clip-text text-[1.05rem] font-bold tracking-tight text-transparent",
            nameClassName,
          )}
        >
          KathaGPT
        </span>
      )}
    </div>
  );
}
