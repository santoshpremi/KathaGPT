import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQueuedMessagesStore } from "../context/queuedMessagesStore";
import { useDraftChatStore } from "../context/draftChatStore";
import { useNavigate } from "../../router";
import { useCurrentOrganizationId } from "../api/useCurrentOrganizationId";

/** Opens a compose view without persisting a chat until the first message is sent. */
export function useDraftChat() {
  const navigate = useNavigate();
  const organizationId = useCurrentOrganizationId();
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const markDraft = useDraftChatStore((s) => s.markDraft);

  const openDraftChat = useCallback(
    async (chatId?: string) => {
      const id = chatId ?? uuidv4();
      markDraft(id);
      clearQueue();
      await navigate("/:organizationId/chats/:chatId", {
        params: { organizationId, chatId: id },
      });
      return id;
    },
    [clearQueue, markDraft, navigate, organizationId],
  );

  return { openDraftChat };
}
