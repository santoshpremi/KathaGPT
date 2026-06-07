import { Card, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";
import Lottie from "react-lottie";
import chatBotLoading from "../../assets/chat-bot-show-process.json";
import { GenericLoadingText } from "../util/GenericLoadingText";

export default function WorkflowWizardLoader() {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: 210,
      }}
    >
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: chatBotLoading,
        }}
        height={140}
        width={140}
        isClickToPauseDisabled
        style={{ cursor: "default" }}
      />
      <Typography level="title-md">
        {t("workflowModal.workflowWizard.progressTitle")}
      </Typography>
      <Typography mt={-1} level="body-sm">
        <GenericLoadingText />
      </Typography>
    </Card>
  );
}
