import { AddCircleOutline } from "@mui/icons-material";
import { Card, CardContent, Stack, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";

interface CustomWorkflowCardProps {
  onClick: () => void;
}

export function CustomWorkflowCard({ onClick }: CustomWorkflowCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        minHeight: 120,
        width: "100%",
        border: "1px solid",
        borderColor: "primary.500",
        "&:hover": {
          backgroundColor: "background.level1",
          cursor: "pointer",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1}>
          <AddCircleOutline color="primary" sx={{ fontSize: 18 }} />
          <Typography color="primary" level="title-sm" fontWeight={600}>
            {t("workflowModal.manualWorkflow.custom")}
          </Typography>
        </Stack>
        <Typography level="body-sm" sx={{ color: "primary.500" }}>
          {t("workflowModal.manualWorkflow.customDescription")}
        </Typography>
      </CardContent>
    </Card>
  );
}
