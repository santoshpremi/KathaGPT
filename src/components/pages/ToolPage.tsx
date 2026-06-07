import { ArrowBack } from "@mui/icons-material";
import { Button, Card, Typography } from "@mui/joy";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "../../router";
import { useCreateChat, useUpdateChat } from "../../lib/api/rust";
import { useTranslation } from "../../lib/i18n";
import { useQueuedMessagesStore } from "../../lib/context/queuedMessagesStore";
import type { ModelOverride } from "@backend/api/chat/chatTypes";

interface ToolPageProps {
  title: string;
  description: string;
  prompt?: string;
  modelOverride?: string;
}

export function ToolPage({
  title,
  description,
  prompt,
  modelOverride,
}: ToolPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams("/:organizationId");
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const { mutateAsync: setModelOverride } = useUpdateChat();

  const startChat = async () => {
    const chatId = uuidv4();
    await createChat({
      id: chatId,
      name: title,
      organizationId: params.organizationId,
    });
    if (modelOverride) {
      await setModelOverride({
        chatId,
        modelOverride: modelOverride as ModelOverride,
      });
    }
    clearQueue();
    if (prompt) {
      enqueueMessage({
        chatId,
        content: prompt,
        modelOverride: modelOverride as ModelOverride | undefined,
      });
    }
    void navigate("/:organizationId/chats/:chatId", {
      params: { organizationId: params.organizationId, chatId },
    });
  };

  return (
    <div className="flex h-full w-full flex-col p-6">
      <Button
        variant="plain"
        color="neutral"
        startDecorator={<ArrowBack />}
        onClick={() =>
          navigate("/:organizationId", {
            params: { organizationId: params.organizationId },
          })
        }
        className="!mb-4 !self-start"
      >
        {t("back")}
      </Button>
      <Card className="!mx-auto !w-full !max-w-2xl !p-8">
        <Typography level="h3" className="!mb-2">
          {title}
        </Typography>
        <Typography
          level="body-md"
          className="!mb-6 !text-[var(--joy-palette-neutral-600)]"
        >
          {description}
        </Typography>
        <Button loading={isPending} onClick={() => void startChat()}>
          {t("newChat")}
        </Button>
      </Card>
    </div>
  );
}
