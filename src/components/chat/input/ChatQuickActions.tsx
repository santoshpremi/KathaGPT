import {
  AnalyticsOutlined,
  DescriptionOutlined,
  EmailOutlined,
  SummarizeOutlined,
} from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useTranslation } from "../../../lib/i18n";

export function ChatQuickActions({
  disabled,
  onAction,
}: {
  disabled?: boolean;
  onAction: (prompt: string) => void;
}) {
  const { t } = useTranslation();

  const actions = [
    {
      label: t("chat.quickActions.documents"),
      icon: <DescriptionOutlined fontSize="small" />,
      prompt: t("chat.quickActions.documentsPrompt"),
    },
    {
      label: t("chat.quickActions.analyze"),
      icon: <AnalyticsOutlined fontSize="small" />,
      prompt: t("chat.quickActions.analyzePrompt"),
    },
    {
      label: t("chat.quickActions.summarize"),
      icon: <SummarizeOutlined fontSize="small" />,
      prompt: t("chat.quickActions.summarizePrompt"),
    },
    {
      label: t("chat.quickActions.email"),
      icon: <EmailOutlined fontSize="small" />,
      prompt: t("chat.quickActions.emailPrompt"),
    },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 px-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant="plain"
          color="neutral"
          disabled={disabled}
          startDecorator={action.icon}
          onClick={() => onAction(action.prompt)}
          className="!rounded-full !font-normal"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
