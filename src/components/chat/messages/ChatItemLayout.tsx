import { Card } from "@mui/joy";
import { twMerge } from "tailwind-merge";
import type { PropsWithChildren } from "react";
import React from "react";
import { type Message } from "@backend/api/chat/message/messageTypes";
export function ChatItemLayout({
  embedded,
  message,
  generating,
  error,
  icon,
  children,
}: PropsWithChildren<{
  embedded?: boolean;
  message: Message | null;
  generating?: boolean;
  icon?: React.ReactNode;
  error?: boolean;
}>) {
  const fromAi = message?.fromAi ?? true;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={twMerge(
        "mx-auto my-3 flex w-full max-w-3xl flex-row items-start gap-4 px-4",
        embedded && "mx-0 my-2 max-w-none gap-2 px-0",
        fromAi && "aiMessage",
      )}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {icon && <div>{icon}</div>}
        </div>
      </div>
      <div
        className={twMerge(
          "flex-grow basis-0 overflow-hidden",
          embedded && fromAi && "pr-10",
          embedded && !fromAi && "pl-20",
        )}
      >
        <Card
          variant={error ? "soft" : "plain"}
          color={error ? "danger" : "neutral"}
          className={twMerge(
            "relative flex w-full flex-col rounded-2xl px-4 py-2 !shadow-none",
            fromAi && "!border-0 !bg-transparent",
            !fromAi && "!ml-auto max-w-[85%] !border-0 !bg-[#f4f4f4]",
          )}
        >
          {children}
        </Card>
      </div>
    </div>
  );
}
