import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SimCardDownload } from "@mui/icons-material";
import { LLM_META } from "@backend/ai/llmMeta";
import { type Message } from "@backend/api/chat/message/messageTypes";

export function ErrorMessageText({
  errorCode,
  errorCodeDetails,
  message,
  guidelines,
}: {
  errorCode: string;
  errorCodeDetails: string;
  message: Message;
  guidelines: string | null | undefined;
}) {
  const { t } = useTranslation();
  let errorMessageExtension = "";
  let filterCategories: string | null = null;
  if (errorCode === "content_filter") {
    if (errorCodeDetails !== "") {
      errorMessageExtension = "_reason";
    }
    filterCategories = errorCodeDetails === "" ? null : errorCodeDetails;
  }
  const showQuote = ![
    "context_length_exceeded",
    "document_generation_error",
    "rag_search_failed",
  ].includes(errorCode);

  const showColon = !["unknown_error", "document_generation_error"].includes(
    errorCode,
  );

  return (
    <>
      {showQuote && (
        <Typography
          component="div"
          style={{
            fontStyle: "italic",
            color: "danger",
            marginBottom: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          &quot;{message.content}&quot;
        </Typography>
      )}

      <div className="mb-5 flex items-center gap-2">
        {errorCode === "document_generation_error" && (
          <SimCardDownload
            color="error"
            sx={{
              fontSize: "30px",
            }}
          />
        )}
        <Typography whiteSpace="pre-wrap" pr={7}>
          {t("modelErrors." + errorCode + errorMessageExtension, {
            model: message.generationModel && LLM_META[message.generationModel]?.name || "",
            filterCategories,
            format: errorCodeDetails,
          })}
          {errorCode === "content_filter" &&
            guidelines &&
            t("modelErrors.readGuidelines")}
          {showColon ? ":" : "."}
        </Typography>
      </div>
    </>
  );
}
