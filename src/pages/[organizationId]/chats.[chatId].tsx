export { ErrorDisplay as Catch } from "../../components/util/ErrorDisplay";

import { ChatInterface } from "../../components/chat/ChatInterface";
import { useParams } from "../../router";

export default function Chat() {
  const params = useParams("/:organizationId/chats/:chatId");

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <ChatInterface key={params.chatId} chatId={params.chatId} />
    </div>
  );
}
