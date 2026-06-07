import { Typography } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Typography>{t("errorDisplay.404.title")}</Typography>
        <Typography>{t("errorDisplay.404.helpText")}</Typography>
      </div>
    </div>
  );
}
