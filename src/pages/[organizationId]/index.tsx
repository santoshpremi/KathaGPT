// src/pages/[organizationId]/index.tsx
import { useEffect, useState } from "react";
import { useParams } from "../../router";
import { useChatList } from "../../lib/api/rust";
import { CircularProgress, Typography } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";
import { useDraftChat } from "../../lib/hooks/useDraftChat";

export default function OrganizationHomePage() {
  return <OrganizationHome />;
}

function OrganizationHome() {
  const params = useParams("/:organizationId");
  const { t } = useTranslation();
  const [draftChatId, setDraftChatId] = useState<string | null>(null);
  const { openDraftChat } = useDraftChat();

  const { data: chatsData, isLoading, isFetched } = useChatList(
    1,
    params.organizationId,
  );

  useEffect(() => {
    if (isLoading || !isFetched || draftChatId) return;
    if (chatsData?.items && chatsData.items.length > 0) return;

    void openDraftChat().then((id) => setDraftChatId(id));
  }, [isLoading, isFetched, chatsData, draftChatId, openDraftChat]);

  const chatId = draftChatId ?? chatsData?.items?.[0]?.id;

  useEffect(() => {
    if (!chatId) return;
    const target = `/${params.organizationId}/chats/${chatId}`;
    if (window.location.pathname !== target) {
      window.location.replace(target);
    }
  }, [chatId, params.organizationId]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <CircularProgress />
        <Typography level="body-lg">
          {t("loading", "Loading chat...")}
        </Typography>
      </div>
    </div>
  );
}