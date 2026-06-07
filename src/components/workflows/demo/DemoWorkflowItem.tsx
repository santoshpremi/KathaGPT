import { PlayCircle } from "@mui/icons-material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DEMO_WORKFLOW } from "./DEMO_WORKFLOW";
import { useCreateChat } from "../../../lib/api/rust";
import { useNavigate, useParams } from "../../../router";
import { useQueuedMessagesStore } from "../../../lib/context/queuedMessagesStore";
import { toast } from "react-toastify";
import { replaceAll } from "../../util/polyfill";
import { useTranslation } from "../../../lib/i18n";
import { LeafItem } from "../../sidebar/tree/LeafItem";
import { RunWorkflowModal } from "../../sidebar/workflows/RunWorkflowModal";

export function DemoWorkflowItem() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams("/:organizationId");
  const clearMessageQueue = useQueuedMessagesStore((s) => s.clear);
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const { mutateAsync: createChat } = useCreateChat();
  const { t } = useTranslation();

  const onInit = async (
    values: Record<string, string>,
    _documentIds: string[] = [],
  ) => {
    setModalOpen(false);

    const chatId = uuidv4();
    await createChat({
      id: chatId,
      name: DEMO_WORKFLOW.name,
      organizationId: params.organizationId,
    });

    void navigate("/:organizationId/chats/:chatId", {
      params: {
        organizationId: params.organizationId,
        chatId,
      },
    });

    clearMessageQueue();
    DEMO_WORKFLOW.steps.forEach((step) => {
      let { promptTemplate: content } = step;

      if (content.length > 0) {
        for (const input of DEMO_WORKFLOW.inputs ?? []) {
          content = replaceAll(content, `{{${input.key}}}`, values[input.key]);
        }
        enqueueMessage({
          content,
          chatId,
        });
      }
    });
    toast.success(t("workflowExecuted"));
  };

  const workflowModalProps = {
    id: DEMO_WORKFLOW.id,
    name: DEMO_WORKFLOW.name,
    description: DEMO_WORKFLOW.description,
    inputs: DEMO_WORKFLOW.inputs?.map((input) => ({
      ...input,
      type: input.type as "short_text" | "long_text" | "enum" | "toggle",
    })),
  };

  return (
    <>
      <LeafItem
        isSelected={false}
        icon={<PlayCircle fontSize="small" />}
        name="Demo Workflow"
        onClick={() => setModalOpen(true)}
        isDemo
      />
      <RunWorkflowModal
        workflow={workflowModalProps}
        open={modalOpen}
        setOpen={setModalOpen}
        onSubmit={onInit}
        isDemo
      />
    </>
  );
}
