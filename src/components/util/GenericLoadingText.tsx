import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LOADING_TEXT_SIZE = 10;

/* dynamic loading text keys
t("loadingTexts.1")
t("loadingTexts.2")
t("loadingTexts.3")
t("loadingTexts.4")
t("loadingTexts.5")
t("loadingTexts.6")
t("loadingTexts.7")
t("loadingTexts.8")
t("loadingTexts.9")
t("loadingTexts.10")
*/

export function GenericLoadingText() {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();

  // shuffle the loading text every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_TEXT_SIZE);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return t("loadingTexts." + (index + 1));
}
