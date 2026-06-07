import { LlmName } from "@backend/ai/llmMeta";
import { type Chat } from "@backend/api/chat/chatTypes";
import type {
  MessageGenerationProgress,
  Message,
} from "@backend/api/chat/message/messageTypes";
import { useOrganization } from "../../../lib/api/organization";
import { TextMessage } from "./messageCategories/textMessage/TextMessage";
import { DocumentMessage } from "./messageCategories/documentMessage/DocumentMessage";
import { ErrorMessage } from "./messageCategories/errorMessage/ErrorMessage";

export function ChatItem({
  chat,
  embedded,
  regenerateMessage,
  message,
  onEdit,
  setModelOverride,
  progress,
}: {
  chat: Chat;
  embedded?: boolean;
  regenerateMessage: (message: Message) => Promise<void>;
  message: Message;
  onEdit: (content: string) => void;
  setModelOverride: (model: LlmName) => void;
  progress: MessageGenerationProgress | undefined;
}) {
  const organization = useOrganization();
  const currentModel = chat?.modelOverride
    ? LlmName.parse(chat.modelOverride)
    : organization?.defaultModel;
  const generationModel: LlmName = (message?.generationModel ??
    currentModel ??
    "gpt-4o-mini") as LlmName;

  if (message.errorCode) {
    return (
      <ErrorMessage
        key={message.id}
        message={message}
        onEdit={onEdit}
        selectModel={setModelOverride}
      />
    );
  } else if (message.outputDocumentUrl) {
    return (
      <DocumentMessage
        outputDocumentUrl={message.outputDocumentUrl}
        generationModel={generationModel}
      />
    );
  } else {
    return (
      <TextMessage
        chat={chat}
        embedded={embedded}
        message={{
          ...message,
          responseCompleted:
            message.responseCompleted || !message.id.includes("temp"), // if the message is not a temp message, it is completed
        }}
        key={message.id}
        onRegenerate={() => {
          regenerateMessage(message).catch(console.error); // can only throw if the message is not found and handles it internally or api errors which are handled by the api
        }}
        onEdit={onEdit}
        progress={progress}
      />
    );
  }
}
