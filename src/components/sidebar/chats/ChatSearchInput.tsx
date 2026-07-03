import { Search } from "@mui/icons-material";
import { Input } from "@mui/joy";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useTranslation } from "../../../lib/i18n";
import { CHAT_SEARCH_INPUT_ID } from "../../../lib/testIds";

export type ChatSearchInputHandle = {
  focus: () => void;
};

export const ChatSearchInput = forwardRef<
  ChatSearchInputHandle,
  {
    value: string;
    onChange: (value: string) => void;
    isSidebarOpen: boolean;
  }
>(function ChatSearchInput({ value, onChange, isSidebarOpen }, ref) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!isSidebarOpen) return null;

  return (
    <Input
      size="sm"
      startDecorator={<Search sx={{ fontSize: "1rem" }} />}
      placeholder={t("sidebar.chatSearchPlaceholder")}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ mb: 1 }}
      slotProps={{
        input: {
          ref: inputRef,
          "data-testid": CHAT_SEARCH_INPUT_ID,
        },
      }}
    />
  );
});
