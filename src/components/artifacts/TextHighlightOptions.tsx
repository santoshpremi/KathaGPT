import { useEffect } from "react";
import { Button, Divider, Input, Stack } from "@mui/joy";
import { useTranslation } from "react-i18next";

import { useRef } from "react";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { SmartIterations } from "../chat/input/SmartIterations";

interface HighlightOptionsProps {
  style: React.CSSProperties;
  onImprove: (text: string) => void;
  initShowInput?: boolean;
}

export default function TextHighlightOptions({
  style,
  onImprove,
  initShowInput = false,
}: HighlightOptionsProps) {
  const [refineInput, setRefineInput] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(initShowInput);

  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleImprove = (prompt: string) => {
    if (prompt.length === 0) return;
    onImprove(prompt);
    setShowInput(false);
    setRefineInput("");
  };

  useEffect(() => {
    if (!showInput || !inputRef.current) return;
    inputRef.current.focus();
  }, [showInput]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={style}
      className="fixed overflow-hidden rounded-lg border border-gray-200 bg-white/90 p-1 shadow-lg backdrop-blur-sm"
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                duration: 0.1,
                ease: "easeInOut",
                width: {
                  type: "spring",
                  stiffness: 600,
                  damping: 50,
                },
              }}
            >
              <Input
                slotProps={{ input: { ref: inputRef } }}
                size="sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImprove(refineInput);
                  }
                }}
                variant="soft"
                placeholder={t("artifact.refineText")}
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                sx={{ height: 34 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!showInput && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SmartIterations
                minimized
                onClick={handleImprove}
                buttonStyle={{ backgroundColor: "transparent", border: 0 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!showInput && <Divider orientation="vertical" />}
        <Button
          disabled={showInput && refineInput.length === 0}
          onClick={() =>
            showInput ? handleImprove(refineInput) : setShowInput(true)
          }
          variant="plain"
        >
          {!showInput ? t("artifact.refine") : t("artifact.apply")}
        </Button>
      </Stack>
    </motion.div>
  );
}
