import { SchoolOutlined } from "@mui/icons-material";
import { Card, Typography } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";
import { useParams } from "../../router";

export default function LearnPage() {
  const { t } = useTranslation();
  const params = useParams("/:organizationId/learn/:workshopId");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <Card className="!max-w-lg !p-8 !text-center">
        <SchoolOutlined sx={{ fontSize: 48, mb: 2, color: "primary.500" }} />
        <Typography level="h3" className="!mb-2">
          {t("learnAndExplore")}
        </Typography>
        <Typography level="body-md" className="!text-[var(--joy-palette-neutral-600)]">
          E-learning workshops will appear here. Workshop ID: {params.workshopId}
        </Typography>
      </Card>
    </div>
  );
}
