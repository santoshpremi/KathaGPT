import { Button, Stack, Typography } from "@mui/joy";
import { useTranslation } from "../../../lib/i18n";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ButtonProps } from "@mui/joy";
import type { SxProps } from "@mui/system";

interface SmartIterationsProps {
  disabled?: boolean;
  minimized?: boolean;
  onClick: (prompt: string) => void;
  buttonStyle?: SxProps;
}

export function SmartIterations({
  disabled,
  minimized,
  onClick,
  buttonStyle,
}: SmartIterationsProps) {
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const stackRef = useRef<HTMLDivElement | null>(null);

  const iterationOptions = [
    {
      label: t("iterations.shorter.label"),
      emoji: "➖",
      prompt: t("iterations.shorter.prompt"),
    },
    {
      label: t("iterations.detail.label"),
      emoji: "➕",
      prompt: t("iterations.detail.prompt"),
    },
    {
      label: t("iterations.improve.label"),
      emoji: "🔧",
      prompt: t("iterations.improve.prompt"),
    },
    {
      label: t("iterations.precise.label"),
      emoji: "🎯",
      prompt: t("iterations.precise.prompt"),
    },
    {
      label: t("iterations.formal.label"),
      emoji: "👔",
      prompt: t("iterations.formal.prompt"),
    },
    {
      label: t("iterations.informal.label"),
      emoji: "👋",
      prompt: t("iterations.informal.prompt"),
    },
    ...(language === "de"
      ? [
          {
            label: "Duzen/Siezen",
            emoji: "👥",
            prompt:
              "Ändere alle Anreden: Ersetze die Du-Form (duzen) durch die Sie-Form (siezen) und umgekehrt.",
          },
        ]
      : []),
  ];

  useEffect(() => {
    // ResizeObserver is not supported in KaiOS which is ok since its the operating system for "dumb" phones
    // eslint-disable-next-line compat/compat
    const resizeObserver = new ResizeObserver((entries) => {
      const buttonWidth = 130; // rough width of extended button
      const entry = entries[0];
      if (!entry) return;

      setIsSmall(
        iterationOptions.length * buttonWidth > entry.contentRect.width - 40,
      );
    });

    if (!stackRef.current?.parentElement) return;
    resizeObserver.observe(stackRef.current.parentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [iterationOptions.length]);

  return (
    <Stack ref={stackRef} direction="row" spacing={1}>
      {iterationOptions.map((option) => (
        <ExpandingButton
          minimized={minimized || isSmall}
          disabled={disabled}
          key={option.label}
          size="sm"
          variant="outlined"
          startDecorator={
            <span className="-mr-[6px]" role="img" aria-label={option.label}>
              {option.emoji}
            </span>
          }
          sx={buttonStyle}
          onClick={() => onClick(option.prompt)}
          label={option.label}
        />
      ))}
    </Stack>
  );
}

interface ExpandingButtonProps extends ButtonProps {
  minimized: boolean;
  label: string;
}

function ExpandingButton({ label, minimized, ...props }: ExpandingButtonProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <Button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ overflow: "hidden", pr: -4 }}
      {...props}
    >
      <motion.div
        transition={{ duration: 0.15 }}
        initial={minimized ? "hidden" : "visible"}
        animate={!minimized || hovered ? "visible" : "hidden"}
        variants={{
          hidden: { width: 0, opacity: 0 },
          visible: { width: "auto", opacity: 1 },
        }}
      >
        <Typography
          color="primary"
          sx={{
            ml: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          level="body-sm"
        >
          {label}
        </Typography>
      </motion.div>
    </Button>
  );
}
