// src/components/util/ErrorDisplay.tsx
import { useTranslation } from "../../lib/i18n";
import { useModals, useNavigate } from "../../router";
import { Button, Card, Typography } from "@mui/joy";
import { ArrowBack, InsertComment, Refresh } from "@mui/icons-material";
import { BrandedLogo } from "../branding/BrandedLogo";
import { useRouteError } from "react-router";

export function ErrorDisplay() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeError = useRouteError() as string | undefined;
  const modals = useModals();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    void navigate(-1);
  };

  const handleFeedback = () => {
    modals.open("/feedback");
  };

  const shownError = routeError?.toString();

  return (
      <div className="flex h-[100vh] w-full flex-grow -translate-y-20 items-center justify-center">
        <div className="py-auto text-center">
          <BrandedLogo className="mx-auto mb-10 h-24" />
          <Typography level="h2">{t("errorDisplay.title")}</Typography>

          <div color="primary">
            <Typography level="body-md" color="neutral">
              {t("errorDisplay.helpText")}
            </Typography>
          </div>

          {shownError && (
            <Card sx={{ mt: 2 }}>
              <Typography level="body-xs" sx={{ opacity: 0.9 }}>
                {shownError}
              </Typography>
            </Card>
          )}
          <div className="mt-4 flex space-x-2">
            <OptionButton
              icon={<ArrowBack sx={{ height: 16 }} />}
              text={t("goBack")}
              onClick={handleGoBack}
            />
            <OptionButton
              icon={<Refresh sx={{ height: 16 }} />}
              text={t("retry")}
              onClick={handleRetry}
            />
            <OptionButton
              icon={<InsertComment sx={{ height: 16 }} />}
              text={t("submitFeedback")}
              onClick={handleFeedback}
            />
          </div>
        </div>
      </div>
  );
}

interface OptionButtonProps {
  text: string;
  onClick: () => void;
  icon: React.ReactNode;
}

function OptionButton({ text, icon, onClick }: OptionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      color="neutral"
      sx={{
        borderColor: "lightgray",
        flex: 1,
        gap: 0.5,
      }}
    >
      {icon}
      <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
        {text}
      </Typography>
    </Button>
  );
}
