import { useCallback, useState } from "react";
import { useOrganizationApi } from "./hooks/useApi";
import { toast } from "react-toastify";
import { useTranslation } from "./i18n";

interface DownloadAsDocOptions {
  markdown: string;
  filename: string;
  templateId?: string;
}

export const useDownloadAsDoc = ({
  markdown,
  filename,
  templateId,
}: DownloadAsDocOptions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  // Safari has issues with certain characters in filenames
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, "-");

  const orgApi = useOrganizationApi({
    disableErrorToast: true,
  });

  const downloadDocument = useCallback(
    async (format: "docx" | "pdf" | "xlsx") => {
      setIsLoading(true);
      try {
        const res = await orgApi.post(
          `documents/download`,
          {
            markdown,
            filename: sanitizedFilename,
            format,
            templateId,
          },
          {
            responseType: "blob",
          },
        );

        const href = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = href;
        link.download = `${sanitizedFilename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        toast.error(t("modelErrors.document_generation_error", { format }));
      } finally {
        setIsLoading(false);
      }
    },
    [markdown, sanitizedFilename, orgApi, setIsLoading, templateId, t],
  );

  return { downloadDocument, isLoading };
};
