import { useTranslation } from "react-i18next";
import { usePrimaryColor } from "../../../../lib/hooks/useTheme";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { Chip, ChipDelete, Typography } from "@mui/joy";

interface SourceChipProps {
  text: string;
  onDelete: () => void;
}
export function SourceChip({ text, onDelete }: SourceChipProps) {
  return (
    <Chip
      variant="solid"
      color="primary"
      sx={{
        px: 1.5,
        py: 0.5,
      }}
      endDecorator={<ChipDelete onDelete={onDelete} />}
    >
      {text}
    </Chip>
  );
}

interface NewSourceChipProps {
  className: string;
  onClick: () => void;
}

export function NewSourceChip({ onClick, className }: NewSourceChipProps) {
  const { t } = useTranslation();
  const primaryColor = usePrimaryColor();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      transition={{ duration: 0.2 }}
      className={twMerge("absolute z-20 cursor-pointer shadow-md", className)}
    >
      <div
        className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 transform"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        style={{ backgroundColor: primaryColor }}
        className="rounded-md px-3 py-1"
        onClick={onClick}
      >
        <Typography level="body-xs" textColor="common.white">
          {t("knowledgeBase.newSourceAvailable")}
        </Typography>
      </div>
    </motion.div>
  );
}
