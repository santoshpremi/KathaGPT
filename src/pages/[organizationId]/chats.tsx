// src/pages/[organizationId]/chats.tsx
import { Typography, Button } from "@mui/joy";
import { useParams } from "../../router";
import { useChatList } from "../../lib/api/rust";
import { useTranslation } from "../../lib/i18n";
import { DelayedLoader } from "../../components/util/DelayedLoader";
import { BulkChatsList } from "../../components/sidebar/chats/BulkChatsList";
import { Add } from "@mui/icons-material";
import { useNewChat } from "../../lib/hooks/useNewChat";

export default function ChatsPage() {
  return <ChatsPageContent />;
}

function ChatsPageContent() {
  const { t } = useTranslation();
  const params = useParams("/:organizationId");

  const { data: chatsData, isLoading } = useChatList(50, params.organizationId);
  const { startNewChat } = useNewChat();

  const handleNewChat = () => {
    void startNewChat();
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <DelayedLoader />
      </div>
    );
  }

  const chats = chatsData?.items || [];

  return (
    <div className="flex h-full w-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <Typography level="h2">{t("sidebar.allChats", "All Chats")}</Typography>
        <Button
          onClick={handleNewChat}
          startDecorator={<Add />}
          variant="solid"
        >
          {t("newChat", "New Chat")}
        </Button>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Typography level="body-lg" color="neutral">
            {t("noChats", "No chats yet")}
          </Typography>
          <Button
            onClick={handleNewChat}
            startDecorator={<Add />}
            variant="outlined"
            size="lg"
          >
            {t("createFirstChat", "Create your first chat")}
          </Button>
        </div>
      ) : (
        <BulkChatsList chats={chats} organizationId={params.organizationId} />
      )}
    </div>
  );
}
