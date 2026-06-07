import { Button } from "@mui/joy";
import { Replay } from "@mui/icons-material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentFilterActions } from "./actions/ContentFilterActions";
import { ContextLengthActions } from "./actions/ContextLengthActions";
import { RateLimitActions } from "./actions/RateLimitActions";
import { type LlmName } from "@backend/ai/llmMeta";
import { type Message } from "@backend/api/chat/message/messageTypes";
import { GuidelinesModal } from "../../../../util/GuidelinesModal";

export function ErrorMessageOptions({
  errorCode,
  errorCodeDetails,
  onEdit,
  message,
  selectModel,
  guidelines,
  setEditing,
}: {
  errorCode: string;
  errorCodeDetails: string;
  onEdit: (content: string) => void;
  message: Message;
  selectModel: (model: LlmName) => void;
  guidelines: string | null | undefined;
  setEditing: (isEditing: boolean) => void;
}) {
  const { t } = useTranslation();
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const switchToModel = (model: LlmName) => {
    selectModel(model);
    onEdit(message.content);
  };

  function retry() {
    onEdit(message.content);
  }

  const showRetryButton = !["document_generation_error"].includes(errorCode);

  return (
    <>
      <GuidelinesModal
        isOpen={guidelinesModalOpen}
        onClose={() => {
          setGuidelinesModalOpen(false);
        }}
      />
      <div className="flex gap-2">
        {showRetryButton && (
          <Button
            onClick={retry}
            variant="outlined"
            color="neutral"
            startDecorator={<Replay />}
          >
            {t("retry")}
          </Button>
        )}
        {errorCode === "content_filter" && (
          <ContentFilterActions
            guidelines={guidelines}
            setEditing={setEditing}
            setGuidelinesModalOpen={setGuidelinesModalOpen}
          />
        )}
        {errorCode === "context_length_exceeded" && (
          <ContextLengthActions
            errorCodeDetails={errorCodeDetails}
            switchToModel={switchToModel}
          />
        )}
        {errorCode == "rate_limit_exceeded" && (
          <RateLimitActions message={message} switchToModel={switchToModel} />
        )}
      </div>
    </>
  );
}
