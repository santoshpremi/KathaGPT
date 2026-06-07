import { PlayCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useDocumentIntelligenceEnabled,
  usePersonalDepartment,
  useToggleWorkflowFavorite,
  useUpdateWorkflow,
  useWorkflowById,
} from "../../../lib/api/localHooks";
import { useCreateChat } from "../../../lib/api/rust";
import { useQueuedMessagesStore } from "../../../lib/context/queuedMessagesStore";
import { handleGenericError } from "../../../lib/errorHandling";
import { useTranslation } from "../../../lib/i18n";
import { useNavigate, useParams } from "../../../router";
import { replaceAll } from "../../util/polyfill";
import { RunWorkflowModal } from "./RunWorkflowModal";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import type { WorkflowStep } from "@backend/api/workflow/workflowTypes";
import { LeafItemDropdown } from "../tree/LeafItemDropdown";
import { LeafItem } from "../tree/LeafItem";
import { ConfirmModal } from "../tree/ConfirmModal";

interface Document {
  id: string;
}

type WorkflowInputType = "short_text" | "long_text" | "enum" | "toggle";

interface WorkflowOption {
  value: string;
  label: string;
}

interface SimpleWorkflow {
  id: string;
  name: string;
  description?: string;
  inputs?: Array<{
    key: string;
    name: string;
    type: WorkflowInputType;
    options: WorkflowOption[];
  }>;
  allowDocumentUpload?: boolean;
}

export function WorkflowItem({
  workflowId,
  onAction,
  isFavorite,
}: {
  workflowId: string;
  onAction?: () => void;
  isFavorite?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams("/:organizationId");

  const { data: workflow } = useWorkflowById(workflowId);
  const { data: department } = usePersonalDepartment();
  const { mutateAsync: deleteWorkflow } = useUpdateWorkflow();
  const { mutateAsync: createChat } = useCreateChat();
  const { mutateAsync: toggleFavorite } = useToggleWorkflowFavorite();

  const isSelected = false;

  const onDelete = async () => {
    await deleteWorkflow({
      id: workflowId,
      index: -1,
    });
    toast.success(t("workflowDeleted"));
    void navigate("/:organizationId/workflows", { params });
  };

  const { data: documentIntelligenceEnabled } =
    useDocumentIntelligenceEnabled();

  const hasInputs =
    (workflow?.inputs?.length ?? 0) > 0 ||
    (workflow?.allowDocumentUpload && documentIntelligenceEnabled);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { mutateAsync: trackUsage } = useUpdateWorkflow();
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const clearMessageQueue = useQueuedMessagesStore((s) => s.clear);

  if (!workflow) return null;

  const hasSteps = workflow.steps.length > 0;

  const onInit = async (
    values: Record<string, string>,
    attachmentIds: string[],
  ) => {
    setModalOpen(false);

    attachmentIds = [
      ...new Set([
        ...attachmentIds,
        ...(workflow.includedDocuments ?? []).map((doc: Document) => doc.id),
      ]),
    ];

    const chatId = crypto.randomUUID();
    await createChat({
      id: chatId,
      name: workflow.name,
      organizationId: params.organizationId,
    });

    try {
      await trackUsage({
        id: workflowId,
        updatedAt: new Date(),
      });

      void navigate("/:organizationId/chats/:chatId", {
        params: {
          organizationId: params.organizationId,
          chatId,
        },
      });

      let modelOverride: ModelOverride | undefined | null;
      if (hasSteps) {
        clearMessageQueue();
        workflow.steps.forEach((step: WorkflowStep) => {
          let { promptTemplate: content } = step;
          modelOverride = step.modelOverride as ModelOverride | null;

          if (content.length > 0) {
            for (const input of workflow.inputs ?? []) {
              content = replaceAll(
                content,
                `{{${input.key}}}`,
                values[input.key],
              );
            }
            enqueueMessage({
              content,
              chatId,
              attachmentIds: step.order === 0 ? attachmentIds : undefined,
              modelOverride: (modelOverride ??
                workflow.modelOverride ??
                "gpt-4o-mini") as ModelOverride,
              outputFormat:
                step.order === workflow.steps.length - 1
                  ? workflow.outputFormat
                  : undefined,
            });
          }
        });
        if (workflow.outputFormat) {
          enqueueMessage({
            content: " ",
            chatId,
            modelOverride: (modelOverride ??
              workflow.modelOverride ??
              "gpt-4o-mini") as ModelOverride,
            outputFormat: workflow.outputFormat,
            workflowExecutionId: workflowId,
          });
        }
      }
    } catch (error: unknown) {
      handleGenericError(
        error instanceof Error
          ? error
          : new Error("Track workflow execution failed"),
        "workflowExecutionFailed",
        { source: "workflow" },
      );
    }
    toast.success(t("workflowExecuted"));
    onAction?.();
  };

  const onClick = () => {
    if (hasInputs) {
      setModalOpen(true);
    } else {
      onInit({}, []).catch(console.error);
    }
  };

  const workflowForModal: SimpleWorkflow = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    inputs: workflow.inputs?.map((input) => ({
      ...input,
      type: input.type as WorkflowInputType,
    })),
    allowDocumentUpload: workflow.allowDocumentUpload,
  };

  return (
    <>
      <LeafItem
        isSelected={isSelected}
        icon={
          <PlayCircleOutline
            sx={{ fontSize: "1.2rem", ml: 3.2 }}
            color={isSelected ? "primary" : undefined}
          />
        }
        name={workflow.name}
        onClick={onClick}
        singleLine={true}
        endDecorator={
          <div onClick={(e) => e.stopPropagation()} className="h-[22px]">
            <LeafItemDropdown
              onEdit={
                department?.id
                  ? () => {
                      onAction?.();
                      void navigate("/:organizationId/workflows/:workflowId", {
                        params: {
                          organizationId: params.organizationId,
                          workflowId: workflowId,
                        },
                      });
                    }
                  : undefined
              }
              onToggleFavorite={async () => {
                await toggleFavorite(workflowId).catch((error: Error) =>
                  handleGenericError(
                    error,
                    "toggleWorkflowFavoriteFailed",
                    { source: "workflow" },
                  ),
                );
              }}
              onDelete={
                department?.id
                  ? () => {
                      setConfirmModalOpen(true);
                    }
                  : undefined
              }
              isFavorite={isFavorite}
            ></LeafItemDropdown>
          </div>
        }
      />
      {hasInputs && hasSteps && (
        <RunWorkflowModal
          workflow={workflowForModal}
          open={modalOpen}
          setOpen={setModalOpen}
          onSubmit={onInit}
        />
      )}
      <ConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onSure={onDelete}
      />
    </>
  );
}
