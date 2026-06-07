import { useEffect, useState } from "react";
import { useNavigate } from "../router";
import { useTranslation } from "../lib/i18n";
import { Typography, CircularProgress } from "@mui/joy";
import { rustFetch } from "../lib/api/rust/client";
import { DEV_ORG_ID } from "../lib/local/seed";

interface ProviderKeyStatus {
  id: string;
  configured: boolean;
}

export default function IndexPage() {
  return <OrganizationRedirect />;
}

function OrganizationRedirect() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function redirect() {
      try {
        const keys = await rustFetch<ProviderKeyStatus[]>("/provider-keys/status");
        const hasKey = keys.some((k) => k.configured);
        const onboarded = localStorage.getItem("kathagpt_onboarded") === "true";

        if (!cancelled) {
          if (!hasKey && !onboarded) {
            window.location.replace("/onboarding");
          } else {
            void navigate("/:organizationId", {
              params: { organizationId: DEV_ORG_ID },
              replace: true,
            });
          }
        }
      } catch {
        if (!cancelled) {
          void navigate("/:organizationId", {
            params: { organizationId: DEV_ORG_ID },
            replace: true,
          });
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void redirect();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <CircularProgress />
        <Typography level="body-lg">
          {t("loading", "Loading...")}
        </Typography>
      </div>
    </div>
  );
}
