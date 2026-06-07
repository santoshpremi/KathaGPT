import { AutoAwesome } from "@mui/icons-material";
import { Typography, Button } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { BrandedLogo } from "../branding/BrandedLogo";
import { useNewChat } from "../../lib/hooks/useNewChat";

export function ChatNotFound() {
  const t = useTranslation().t;
  const { startNewChat } = useNewChat();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <BrandedLogo width={300} className="mb-4" />
      <Typography level="h1" my={2} className="text-center">
        {t("chatNotFound")}
      </Typography>
      <Typography level="body-sm" className="text-center">
        {t("chatNotFoundDescription")}
      </Typography>
      <div className="mt-4 flex gap-2">
        <Button
          size="lg"
          variant="outlined"
          startDecorator={<AutoAwesome fontSize="small" />}
          onClick={() => void startNewChat()}
        >
          {t("newChat", "Start New Chat")}
        </Button>
      </div>
    </div>
  );
}
