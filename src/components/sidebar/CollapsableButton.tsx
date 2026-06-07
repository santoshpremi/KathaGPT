import { type ButtonProps, Tooltip, Button } from "@mui/joy";
import { Link, type Path } from "../../router";
import { cloneElement } from "react";
import { cn } from "../../lib/cn";
import { type SxProps } from "@mui/joy/styles/types";

export function CollapsableButton({
  icon,
  isSidebarOpen,
  content,
  className,
  onClick,
  isActive,
  to,
  params,
  contentStyle,
  iconSx,
  ...props
}: {
  icon: React.ReactElement;
  isSidebarOpen: boolean;
  content: string;
  isActive?: boolean;
  onClick?: () => void;
  to?: Path;
  params?: Record<string, string>;
  contentStyle?: React.CSSProperties;
  iconSx?: SxProps;
} & ButtonProps) {
  const buttonProps = to
    ? { component: Link, to, params }
    : {};

  return (
    <Tooltip title={isSidebarOpen ? "" : content} placement="right" size="sm">
      <Button
        {...buttonProps}
        size="sm"
        startDecorator={cloneElement(icon, {
          sx: {
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            ...iconSx,
          },
        })}
        fullWidth
        className={cn(
          "!min-h-9 !items-center !gap-2.5 !py-1.5",
          isSidebarOpen ? "!justify-start !px-2" : "!justify-center !px-0",
          className,
        )}
        slotProps={{
          startDecorator: {
            sx: {
              m: 0,
              minWidth: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
        }}
        onClick={onClick}
        color={isActive ? "primary" : "neutral"}
        variant={isActive ? "soft" : "plain"}
        {...props}
      >
        {isSidebarOpen ? (
          <span
            className="truncate leading-none"
            style={{
              fontWeight: 500,
              ...contentStyle,
            }}
          >
            {content}
          </span>
        ) : null}
      </Button>
    </Tooltip>
  );
}
