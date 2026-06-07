import { ToolPage } from "../../../components/pages/ToolPage";
import { useTranslation } from "../../../lib/i18n";

export default function TechSupportPage() {
  const { t } = useTranslation();
  return (
    <ToolPage
      title={t("techSupport.title")}
      description="Get help troubleshooting technical issues with step-by-step guidance."
      prompt="Help me troubleshoot the following technical issue: "
    />
  );
}
