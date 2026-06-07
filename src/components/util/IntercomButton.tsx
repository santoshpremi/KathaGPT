import { IntercomProvider, useIntercom } from "react-use-intercom";
import { HelpCenterResourceLink } from "./HelpCenterModal";
import { Chat } from "@mui/icons-material";
import { useEffect } from "react";
import { useMe } from "../../lib/api/user";
import { useTranslation } from "react-i18next";

const INTERCOM_APP_ID = import.meta.env["VITE_INTERCOM_APP_ID"] ?? "w4yomz16"; // this should never really change but allow override anyway (also not secret)

/**
 * Wrapper for the entire app that initializes and provides Intercom
 */
export function IntercomAppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntercomProvider appId={INTERCOM_APP_ID}>
      <IntercomAppWrapperInner />
      {children}
    </IntercomProvider>
  );
}

function IntercomAppWrapperInner() {
  const { boot, shutdown, update } = useIntercom();

  // booting intercom on mount
  useEffect(() => {
    boot({});
    return () => shutdown();
  }, [boot, shutdown]);

  const me = useMe();

  useEffect(() => {
    update({
      email: me?.primaryEmail ?? undefined,
      name: me?.firstName + " " + me?.lastName,
      userId: me?.id,
    });
  }, [update, me]);

  return null;
}

export function IntercomButton() {
  const { show } = useIntercom();
  const { t } = useTranslation();

  return (
    <HelpCenterResourceLink
      onClick={() => {
        show();
      }}
      icon={<Chat />}
      text={t("liveChat")}
    />
  );
}
