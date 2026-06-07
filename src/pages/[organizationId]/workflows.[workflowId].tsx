import { ArrowBack, PlayCircleOutline } from "@mui/icons-material";
import { Button, Card, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate, useParams } from "../../router";
import { useWorkflowById } from "../../lib/api/localHooks";
import { useCreateChat } from "../../lib/api/rust";
import { useTranslation } from "../../lib/i18n";
import { DelayedLoader } from "../../components/util/DelayedLoader";
import { RunWorkflowModal } from "../../components/sidebar/workflows/RunWorkflowModal";
import { useQueuedMessagesStore } from "../../lib/context/queuedMessagesStore";
import { replaceAll } from "../../components/util/polyfill";
import { toast } from "react-toastify";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import { v4 as uuidv4 } from "uuid";

export default function WorkflowDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams("/:organizationId/workflows/:workflowId");
  const [modalOpen, setModalOpen] = useState(false);
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const { mutateAsync: createChat } = useCreateChat();

  const { data: workflow, isLoading } = useWorkflowById(params.workflowId);

  const runWorkflow = async (
    values: Record<string, string>,
    attachmentIds: string[] = [],
  ) => {
    if (!workflow) return;
    setModalOpen(false);

    const chatId = uuidv4();
    await createChat({
      id: chatId,
      name: workflow.name,
      organizationId: params.organizationId,
    });

    void navigate("/:organizationId/chats/:chatId", {
      params: { organizationId: params.organizationId, chatId },
    });

    clearQueue();
    let modelOverride: ModelOverride | null = null;
    for (const step of workflow.steps) {
      let content = step.promptTemplate;
      if (content.length > 0) {
        for (const input of workflow.inputs ?? []) {
          content = replaceAll(content, `{{${input.key}}}`, values[input.key] ?? "");
        }
        modelOverride = (step.modelOverride ?? workflow.modelOverride ?? "gpt-4o-mini") as ModelOverride;
        enqueueMessage({
          content,
          chatId,
          attachmentIds: step.order === 0 ? attachmentIds : undefined,
          modelOverride,
        });
      }
    }
    toast.success(t("workflowExecuted"));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <DelayedLoader />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <Typography level="h4">{t("noWorkflows")}</Typography>
        <Button
          startDecorator={<ArrowBack />}
          onClick={() =>
            navigate("/:organizationId/workflows", {
              params: { organizationId: params.organizationId },
            })
          }
        >
          {t("back")}
        </Button>
      </div>
    );
  }

  const hasInputs =
    (workflow.inputs?.length ?? 0) > 0 || workflow.allowDocumentUpload;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-6">
      <Button
        variant="plain"
        color="neutral"
        startDecorator={<ArrowBack />}
        onClick={() =>
          navigate("/:organizationId/workflows", {
            params: { organizationId: params.organizationId },
          })
        }
        className="!mb-4 !self-start"
      >
        {t("back")}
      </Button>
      <Card className="!mx-auto !w-full !max-w-2xl !p-8">
        <Typography level="h3" className="!mb-2">
          {workflow.name}
        </Typography>
        {workflow.description && (
          <Typography
            level="body-md"
            className="!mb-6 !text-[var(--joy-palette-neutral-600)]"
          >
            {workflow.description}
          </Typography>
        )}
        <Typography level="body-sm" className="!mb-4">
          {workflow.steps.length} step(s)
        </Typography>
        <Button
          startDecorator={<PlayCircleOutline />}
          onClick={() =>
            hasInputs ? setModalOpen(true) : void runWorkflow({}, [])
          }
        >
          {t("execute")}
        </Button>
      </Card>
      <RunWorkflowModal
        workflow={{
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          inputs: workflow.inputs?.map((input) => ({
            ...input,
            type: input.type as "short_text" | "long_text" | "enum" | "toggle",
          })),
        }}
        open={modalOpen}
        setOpen={setModalOpen}
        onSubmit={runWorkflow}
      />
    </div>
  );
}
