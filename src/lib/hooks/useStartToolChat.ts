import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useCreateChat, useUpdateChat } from "../api/rust";
import { useQueuedMessagesStore } from "../context/queuedMessagesStore";
import { useNavigate } from "../../router";
import { useCurrentOrganizationId } from "../api/useCurrentOrganizationId";
import { useTranslation } from "../i18n";
import type { ModelOverride } from "@backend/api/chat/chatTypes";

export type ToolKey =
  | "imageFactory"
  | "researchAssistant"
  | "meetingTools"
  | "techSupport"
  | "translateContent"
  | "personalAssistant";

const TOOL_CONFIGS: Record<
  ToolKey,
  { titleKey: string; prompt: string; modelOverride?: string }
> = {
  imageFactory: {
    titleKey: "generateImage",
    prompt: "Generate an image based on this description: ",
  },
  researchAssistant: {
    titleKey: "researchAssistant",
    prompt: "Research the following topic and provide sources: ",
    modelOverride: "sonar",
  },
  meetingTools: {
    titleKey: "tools.meetingTools.title",
    prompt: "Summarize the following meeting notes and extract action items: ",
    modelOverride: "gemini-1.5-pro",
  },
  techSupport: {
    titleKey: "techSupport.title",
    prompt: "Help me troubleshoot the following technical issue: ",
  },
  translateContent: {
    titleKey: "translateContent",
    prompt: "Translate the following content to English: ",
  },
  personalAssistant: {
    titleKey: "personalAssistant.titleNotPersonal",
    prompt: "Help me with the following task: ",
  },
};

export function useStartToolChat() {
  const organizationId = useCurrentOrganizationId();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const { mutateAsync: createChat } = useCreateChat();
  const { mutateAsync: setModelOverride } = useUpdateChat();

  const startToolChat = useCallback(
    async (toolKey: ToolKey) => {
      const config = TOOL_CONFIGS[toolKey];
      try {
        const chatId = uuidv4();
        const title = t(config.titleKey);
        await createChat({ id: chatId, name: title, organizationId });
        if (config.modelOverride) {
          await setModelOverride({
            chatId,
            modelOverride: config.modelOverride as ModelOverride,
          });
        }
        clearQueue();
        enqueueMessage({
          chatId,
          content: config.prompt,
          ...(config.modelOverride
            ? { modelOverride: config.modelOverride as ModelOverride }
            : {}),
        });
        await navigate("/:organizationId/chats/:chatId", {
          params: { organizationId, chatId },
        });
      } catch (error) {
        console.error("Failed to start tool chat:", error);
        toast.error(t("chatUpdateFailed"));
      }
    },
    [
      clearQueue,
      createChat,
      enqueueMessage,
      navigate,
      organizationId,
      setModelOverride,
      t,
    ],
  );

  return { startToolChat };
}
