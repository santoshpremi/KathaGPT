import { Add, History } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/joy";
import type { ReactNode } from "react";
import { useTranslation } from "../../lib/i18n";

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

interface ToolPageHeaderProps {
  icon: ReactNode;
  title: string;
  onNewTab: () => void;
  onOpenHistory: () => void;
  trailing?: ReactNode;
}

export function ToolPageHeader({
  icon,
  title,
  onNewTab,
  onOpenHistory,
  trailing,
}: ToolPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #ececf1",
        px: { xs: 2, sm: 3 },
        py: 2,
        flexShrink: 0,
        fontFamily: panelFont,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        {icon}
        <Typography level="title-lg" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        {trailing}
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<Add />}
          onClick={onNewTab}
        >
          {t("toolHistory.newTab")}
        </Button>
        <Button
          variant="outlined"
          size="sm"
          startDecorator={<History />}
          onClick={onOpenHistory}
        >
          {t("toolHistory.title")}
        </Button>
      </Box>
    </Box>
  );
}
