import { useEffect } from "react";
import { CircularProgress, Typography } from "@mui/joy";
import { useNavigate, useParams } from "../../router";
import { useAuthStore } from "../../lib/context/authStore";
import { useTranslation } from "../../lib/i18n";

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams("/:organizationId");
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);

  useEffect(() => {
    setLoggedIn(true);
    void navigate("/:organizationId", {
      params: { organizationId: params.organizationId },
      replace: true,
    });
  }, [navigate, params.organizationId, setLoggedIn]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <CircularProgress />
      <Typography level="body-lg">{t("loading")}</Typography>
    </div>
  );
}
