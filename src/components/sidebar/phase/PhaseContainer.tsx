import { Typography } from "@mui/joy";
import { Stack } from "@mui/system";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type OrganizationPhase } from "@backend/api/organization/organizationTypes";
import { getPhaseProgress } from "./utils";
import { PhaseProgress } from "./PhaseProgress";

interface PhaseContainerProps {
  phase: OrganizationPhase;
  start: string;
  end: string;
  isSidebarOpen?: boolean;
}
export function PhaseContainer({
  phase,
  start,
  end,
  isSidebarOpen,
}: PhaseContainerProps) {
  const { t } = useTranslation();

  const isPilot = phase === "PILOT";

  const { range, remaining } = useMemo(() => {
    return getPhaseProgress(start, end);
  }, [start, end]);

  if (range === 0) return null;
  return (
    <Stack gap={1}>
      {isSidebarOpen && (
        <Stack direction="row" flex={1} justifyContent="space-between">
          <Typography level="body-sm" fontWeight="500" noWrap>
            {isPilot ? t("trial.pilotActive") : t("trial.trialActive")}
          </Typography>
          <Typography level="body-sm" noWrap>
            {t("trial.daysLeft", { count: Math.max(remaining, 0) })}
          </Typography>
        </Stack>
      )}
      <PhaseProgress
        range={range}
        remaining={remaining}
        sx={{ backgroundColor: "rgba(30, 93, 194, .2)" }}
      />
    </Stack>
  );
}
