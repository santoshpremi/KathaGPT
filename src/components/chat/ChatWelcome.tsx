import { Typography } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function ChatWelcome({ firstName }: { firstName?: string | null }) {
  const { t } = useTranslation();
  const name = firstName?.trim() || t("chat.greeting.fallbackName");
  const greetingKey = getGreetingKey();

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-2 px-4 text-center">
      <Typography
        level="body-lg"
        className="!text-[var(--joy-palette-neutral-600)]"
      >
        {t(`chat.greeting.${greetingKey}`, { name })}
      </Typography>
      <Typography level="h2" className="!text-3xl !font-semibold !tracking-tight">
        {t("chat.greeting.headline")}
      </Typography>
    </div>
  );
}
