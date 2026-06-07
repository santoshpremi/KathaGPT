import { useEffect } from "react";
import { useNavigate } from "../router";
import { DEV_ORG_ID } from "../lib/local/seed";

export default function ChatRedirectPage() {
  const navigate = useNavigate();
  const chatId = window.location.pathname.split("/chats/")[1]?.split("/")[0];

  useEffect(() => {
    if (!chatId) return;
    void navigate("/:organizationId/chats/:chatId", {
      params: { organizationId: DEV_ORG_ID, chatId },
      replace: true,
    });
  }, [navigate, chatId]);

  return null;
}
