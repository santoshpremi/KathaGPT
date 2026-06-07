import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChatBubbleOutline, History } from "@mui/icons-material";
import { useNavigate, useParams } from "../../../router";
import { useTranslation } from "../../../lib/i18n";
import { toast } from "react-toastify";
import { type ChatListItem } from "@backend/api/chat/chatTypes";
import { useDeleteChat } from "../../../lib/api/rust";
import { useCurrentOrganizationId } from "../../../lib/api/useCurrentOrganizationId";
import { useNewChat } from "../../../lib/hooks/useNewChat";
import { ConfirmModal } from "../tree/ConfirmModal";
import { LeafItem } from "../tree/LeafItem";
import { LeafItemDropdown } from "../tree/LeafItemDropdown";
import { RenameChatModal } from "./RenameChatModal";
export function ChatsListItem({
  chat,
  isHistoryButton,
}: {
  chat?: ChatListItem;
  isHistoryButton?: boolean;
}) {
  const { t } = useTranslation();
  const organizationId = useCurrentOrganizationId();
  const routeParams = useParams("/:organizationId/chats/:chatId");
  const active = routeParams.chatId === chat?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteChat } = useDeleteChat();
  const { startNewChat } = useNewChat();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  let chatName;

  if (chat?.name) {
    chatName = chat.name;
  } else if (isHistoryButton) {
    chatName = (
      <div className="flex items-center gap-1">
        <History fontSize="small" />
        {t("sidebar.allChats")}
      </div>
    );
  } else {
    chatName = t("untitledChat");
  }

  return (
    <>
      <LeafItem
        icon={
          <ChatBubbleOutline
            sx={{ fontSize: "1rem" }}
            color={active ? "primary" : undefined}
          />
        }
        singleLine={true}
        name={chatName as string}
        endDecorator={
          isHistoryButton ? undefined : (
            <div onClick={(e) => e.stopPropagation()} className="h-[22px]">
              <LeafItemDropdown
                onEdit={() => setRenameModalOpen(true)}
                onDelete={() => setConfirmModalOpen(true)}
              />
            </div>
          )
        }
        isSelected={active}
        onClick={() => {
          if (chat) {
            void navigate("/:organizationId/chats/:chatId", {
              params: { organizationId, chatId: chat.id },
            });
          }
        }}
      />
      {chat && (
        <>
          <RenameChatModal
            chat={chat}
            open={renameModalOpen}
            onClose={() => setRenameModalOpen(false)}
          />
          <ConfirmModal
            open={confirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onSure={() => {
              void (async () => {
                try {
                  const deletedId = chat.id;
                  await deleteChat({ chatId: deletedId });
                  // Navigate away before invalidating so chat.get doesn't refetch a deleted id
                  if (active) {
                    await startNewChat();
                  }
                  await queryClient.invalidateQueries({ queryKey: ["chats"] });
                  toast.success(t("chatDeleted"));
                } catch (e) {
                  console.error(e);
                  toast.error(t("chatDeleteFailed"));
                }
              })();
            }}
          />
        </>
      )}
    </>
  );
}
