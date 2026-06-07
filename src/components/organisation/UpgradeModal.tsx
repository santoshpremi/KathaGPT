import type { PhaseUsageResponse } from "@backend/util/credits/phaseUsage";
import { Trans, useTranslation } from "react-i18next";
import { useMe } from "../../lib/api/user";
import { usePhaseAnalytics } from "../../lib/api/localHooks";
import { Card, Divider, Modal, ModalDialog, Stack, Typography } from "@mui/joy";
import { useTrialStore } from "../../lib/context/trialModalStore";
import { SUPPORT_EMAIL } from "../../shared/constants/contact";

const receiver = SUPPORT_EMAIL;

interface UpgradeModalProps {
  status: PhaseUsageResponse;
}

export function TrialModal() {
  const user = useMe();
  const { status } = useTrialStore();

  if (status === "ok" || user?.isSuperUser) return;

  return <UpgradeModal status={status} />;
}

function UpgradeModal({ status }: UpgradeModalProps) {
  const { t } = useTranslation();

  const { data: metrics } = usePhaseAnalytics();

  const stats = [
    {
      amount: metrics?.numPrompts,
      subtitle: t("trial.promptsSent"),
      enabled: true,
    },
    {
      amount: t("trial.minutes", { amount: metrics?.totalMinutesSaved }),
      subtitle: t("trial.timeSaved"),
      enabled: true,
    },
    {
      amount: metrics?.numWorkflowRuns,
      subtitle: t("trial.workflowsRun"),
      enabled: true,
    },
  ].filter(({ enabled }) => enabled);

  const { title, description } = {
    title:
      status === "creditsExhausted"
        ? t("trial.creditsExhausted.title")
        : t("trial.trialExpired.title"),
    description:
      status === "creditsExhausted"
        ? t("trial.creditsExhausted.subtitle")
        : t("trial.trialExpired.subtitle"),
  };

  return (
    <Modal open>
      <ModalDialog sx={{ p: 1 }}>
        <Card
          variant="plain"
          sx={{
            textAlign: "center",
          }}
        >
          <Typography level="title-lg">{title}</Typography>
          <Stack direction="row" flex={1} spacing={1} mt={2}>
            {metrics &&
              stats.map(({ amount, subtitle }, index) => (
                <Card
                  key={index}
                  style={{ flex: 1, height: 120, justifyContent: "center" }}
                >
                  <Typography level="h3">{amount}</Typography>
                  <Typography level="body-sm" sx={{ mt: -1 }}>
                    {subtitle}
                  </Typography>
                </Card>
              ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography
            level="body-md"
            sx={{ textAlign: "left", color: "black" }}
          >
            <Trans i18nKey="trial.upgradeNow" />
          </Typography>

          <Typography
            level="body-md"
            fontWeight="400"
            sx={{ mt: 4, color: "black" }}
          >
            {t("trial.contactUs")}
          </Typography>
          <Typography level="body-lg" fontWeight="700" sx={{ mt: -1.5 }}>
            {receiver}
          </Typography>
        </Card>
      </ModalDialog>
    </Modal>
  );
}
