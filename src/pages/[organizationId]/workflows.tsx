import { Add } from "@mui/icons-material";
import { Button, Typography } from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { WorkflowsTree } from "../../components/workflows/WorkflowsTree";
import CreateWorkflowModal from "../../components/workflows/CreateWorkflowModal";

export default function WorkflowsPage() {
  const { t } = useTranslation();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchValue] = useState("");

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Typography level="h2">{t("workflows")}</Typography>
        <Button
          startDecorator={<Add />}
          onClick={() => setWizardOpen(true)}
        >
          {t("create")}
        </Button>
      </div>
      <WorkflowsTree searchValue={searchValue} />
      <CreateWorkflowModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
