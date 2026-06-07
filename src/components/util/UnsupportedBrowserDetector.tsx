import { t } from "i18next";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";

export function UnsupportedBrowserDetector() {
  // ulgy but works
  const isSupportedBrowser = useMemo(() => {
    try {
      // check if text decoder is supported
      new TextDecoderStream();

      // check if URL is supported
      new URL("http://example.com");

      // check if Promise.all is supported
      void Promise.all([]).then(() => {});
    } catch (e) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    if (!isSupportedBrowser)
      toast.error(t("errors.outdatedBrowser"), {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: "colored",
      });
  }, [isSupportedBrowser]);

  return null;
}
