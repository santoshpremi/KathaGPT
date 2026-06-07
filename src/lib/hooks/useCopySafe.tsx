import { useCopyToClipboard } from "usehooks-ts";
import { genericErrorHandlerFactory } from "../errorHandling";
import { t } from "i18next";
import { toast } from "react-toastify";

export function useCopySafe() {
  const [, copy] = useCopyToClipboard();
  const successToast = () => {
    toast.success(t("copiedSuccessfully"));
  };

  return (text: string, altText?: string) => {
    try {
      // Ensure that line breaks are preserved when copy pasting to word
      const formattedText = text.replace(/\n/g, "<br/>");
      navigator.clipboard
        .write([
          new ClipboardItem({
            "text/html": new Blob([formattedText], { type: "text/html" }),
            "text/plain": new Blob([altText ?? text], { type: "text/plain" }),
          }),
        ])
        .then(successToast)
        .catch(genericErrorHandlerFactory("errorCannotCopy"));
    } catch {
      copy(altText ?? text)
        .then(() => {
          toast.success(t("copiedSuccessfully"));
        })
        .catch(genericErrorHandlerFactory("errorCannotCopy"));
    }
  };
}
