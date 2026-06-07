import { Box, Typography } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";
import { getUrlDomain } from "../../lib/util";

export interface ResearchReference {
  title: string;
  url: string;
}

export function ResearchReferences({ references }: { references: ResearchReference[] }) {
  const { t } = useTranslation();

  if (!references.length) return null;

  return (
    <Box
      sx={{
        mt: 3,
        pt: 2.5,
        borderTop: "1px solid #e8e8e8",
      }}
    >
      <Typography
        level="title-sm"
        sx={{
          mb: 1.5,
          fontWeight: 700,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          fontSize: "0.75rem",
          color: "neutral.600",
        }}
      >
        {t("research.references")}
      </Typography>
      <Box
        component="ol"
        sx={{
          m: 0,
          pl: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {references.map((ref, index) => (
          <Box
            component="li"
            key={`${ref.url}-${index}`}
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.5,
              color: "neutral.800",
            }}
          >
            <Box
              component="a"
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.700",
                fontWeight: 500,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {ref.title}
            </Box>
            <Typography
              component="span"
              level="body-xs"
              sx={{ color: "neutral.500", ml: 0.75 }}
            >
              — {getUrlDomain(ref.url)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
