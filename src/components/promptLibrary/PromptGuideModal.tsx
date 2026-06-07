import { Close, LightbulbOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useTranslation } from "../../lib/i18n";

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

const PRACTICE_KEYS = [
  "beSpecific",
  "provideContext",
  "defineRole",
  "specifyFormat",
  "useExamples",
  "breakDownTasks",
  "setConstraints",
  "iterateRefine",
  "useVariables",
  "reviewOutput",
] as const;

interface PromptGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function PromptGuideModal({ open, onClose }: PromptGuideModalProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 640,
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          p: 3,
          fontFamily: panelFont,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
          <LightbulbOutlined sx={{ color: "#0891b2", mt: 0.25 }} />
          <Box sx={{ flex: 1 }}>
            <Typography component="h2" level="title-lg" sx={{ fontWeight: 700 }}>
              {t("promptLibrary.practices.title")}
            </Typography>
            <Typography level="body-sm" sx={{ color: "neutral.600", mt: 0.5 }}>
              {t("promptLibrary.practices.intro")}
            </Typography>
          </Box>
          <IconButton variant="plain" size="sm" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box
          component="ol"
          sx={{
            m: 0,
            pl: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          {PRACTICE_KEYS.map((key, index) => (
            <Box component="li" key={key}>
              <Typography level="title-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                {index + 1}. {t(`promptLibrary.practices.items.${key}.title`)}
              </Typography>
              <Typography
                level="body-sm"
                sx={{ color: "neutral.700", lineHeight: 1.65 }}
              >
                {t(`promptLibrary.practices.items.${key}.body`)}
              </Typography>
            </Box>
          ))}
        </Box>
      </ModalDialog>
    </Modal>
  );
}
