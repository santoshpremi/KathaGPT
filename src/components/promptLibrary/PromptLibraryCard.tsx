import {
  AutoStoriesOutlined,
  LightbulbOutlined,
} from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/joy";
import type { ReactNode } from "react";
import { useTranslation } from "../../lib/i18n";

export type PromptCardCategory = "guides" | "saved";

const GRADIENTS = [
  "linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  "linear-gradient(135deg, #db2777 0%, #a855f7 100%)",
  "linear-gradient(135deg, #0891b2 0%, #10b981 100%)",
  "linear-gradient(135deg, #374151 0%, #111827 100%)",
  "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
] as const;

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cardLabel(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "NEW";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

interface PromptLibraryCardProps {
  title: string;
  description: string;
  category: PromptCardCategory;
  createdAt?: string;
  badgeLabel?: string;
  gradientIndex?: number;
  icon?: ReactNode;
  onClick?: () => void;
  endDecorator?: ReactNode;
}

export function PromptLibraryCard({
  title,
  description,
  category,
  createdAt,
  badgeLabel,
  gradientIndex = 0,
  icon,
  onClick,
  endDecorator,
}: PromptLibraryCardProps) {
  const { t } = useTranslation();
  const label = badgeLabel ?? cardLabel(title);
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const isGuide = category === "guides";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid #e8e8ec",
        bgcolor: "#ffffff",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        fontFamily: panelFont,
        position: "relative",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            }
          : undefined,
      }}
    >
      {endDecorator && (
        <Box
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {endDecorator}
        </Box>
      )}

      <Box
        sx={{
          minHeight: 108,
          px: 2,
          py: 1.75,
          background: gradient,
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ opacity: 0.9 }}>
          {icon ??
            (isGuide ? (
              <AutoStoriesOutlined sx={{ fontSize: 22 }} />
            ) : (
              <LightbulbOutlined sx={{ fontSize: 22 }} />
            ))}
        </Box>
        <Typography
          sx={{
            fontSize: "1.35rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            lineHeight: 1.1,
          }}
        >
          {label}
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1, gap: 1 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700, color: "#0d0d0d" }}>
          {title}
        </Typography>
        <Typography
          level="body-sm"
          sx={{
            color: "neutral.600",
            lineHeight: 1.55,
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mt: 0.5,
          }}
        >
          <Chip
            size="sm"
            variant="soft"
            color={isGuide ? "primary" : "success"}
            startDecorator={
              isGuide ? (
                <AutoStoriesOutlined sx={{ fontSize: 14 }} />
              ) : (
                <LightbulbOutlined sx={{ fontSize: 14 }} />
              )
            }
            sx={{ fontWeight: 500 }}
          >
            {isGuide
              ? t("promptLibrary.categories.guides")
              : t("promptLibrary.categories.saved")}
          </Chip>
          {createdAt && (
            <Typography level="body-xs" sx={{ color: "neutral.500" }}>
              {formatDate(createdAt)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
