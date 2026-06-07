import { ToolPage } from "../../../components/pages/ToolPage";
import { useTranslation } from "../../../lib/i18n";

export default function PersonalAssistantPage() {
  const { t } = useTranslation();
  return (
    <ToolPage
      title={t("personalAssistant.titleNotPersonal")}
      description="Your personal AI assistant for everyday tasks, planning, and writing."
      prompt="Help me with the following task: "
    />
  );
}
