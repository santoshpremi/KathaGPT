import { ContentCopy } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export function ErrorToastContent({
  code,
  customMessage,
}: {
  code: string;
  customMessage?: string;
}) {
  const { t } = useTranslation();

  return (
    <div>
      {t(customMessage ?? "errors.unknown")}
      <br />
      {t("errors.withCode")}
      <br />
      <div className="flex flex-row items-center gap-2">
        <code className="cursor-text rounded bg-red-200 px-2 font-mono text-black">
          <strong>{code}</strong>
        </code>
        <Tooltip title="Copy Error Code">
          <IconButton
            size="sm"
            onClick={() =>
              navigator.clipboard.writeText(code).then(() => {
                toast.success(t("copiedErrorCode"));
              })
            }
          >
            <ContentCopy />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
