import type { Select } from "@mui/joy";
import {
  Box,
  Card,
  Chip,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  ModalOverflow,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import type { ComponentProps } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { LlmMetaData, LlmName } from "@backend/ai/llmMeta";
import { LLM_META } from "@backend/ai/llmMeta";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import { useOrganization } from "../../lib/api/organization";
import { useEnabledModels } from "../../lib/api/rust";
import { usePrimaryColor } from "../../lib/hooks/useTheme";
import { useTranslation } from "../../lib/i18n";
import { ModelIcon } from "../../lib/ModelIcon";
import { useUnsafeModelWarning } from "./useUnsafeModelWarning";

/* dynamic translation keys
t("modelMeta.automatic")
t("modelMeta.gpt-3-5-turbo")
t("modelMeta.gpt-4")
t("modelMeta.sonar")
t("modelMeta.gemini-1-5-pro")
t("modelMeta.gemini-2-0-flash")
t("modelMeta.claude-3-7-sonnet")
t("modelMeta.gpt-4o-mini")
t("modelMeta.gpt-4o")
t("modelMeta.o1-us")
t("modelMeta.o1-mini-us")
t("modelMeta.llama-3-3-fast")
t("modelMeta.deepseek-r1")
t("modelMeta.deepseek-v3")
t("modelMeta.claude-3-7-sonnet") 
t("modelMeta.claude-3-7-sonnet-thinking") 
t("modelMeta.o3-mini")
*/

type ModelSelectorProps = {
  selectedModel: ModelOverride | null;
  setSelectedModel: (model: ModelOverride) => void;
  allModels?: boolean;
};

type MultiModelSelectorProps = {
  availableModels: LlmName[];
  selectedModels: string[];
  updateModel: (modelKey: string, enabled: boolean) => Promise<boolean>;
  setDefaultModel?: (model: LlmName) => void;
};

function useAvailableModelsForChat(
  allModels: boolean = false,
): ModelOverride[] {
  const { data: availableModels } = useEnabledModels();
  // this approach filters the meta so the order is preserved
  const models = (Object.entries(LLM_META)
    .filter(
      ([modelName, meta]) =>
        (allModels || meta.allowChat) &&
        availableModels?.includes(modelName as LlmName),
    )
    .map(([key]) => key) ?? []) as ModelOverride[];
  return ["automatic", ...models];
}

export function ModelSelectorModal({
  selectedModel,
  setSelectedModel,
  allModels,
  open,
  onRequestClose,
}: ModelSelectorProps &
  Partial<ComponentProps<typeof Select>> & {
    open: boolean;
    onRequestClose: () => void;
  }) {
  const organization = useOrganization();
  const defaultModel = organization?.defaultModel ?? null;
  const options = useAvailableModelsForChat(allModels);

  const nonEuWarningSkippable = organization?.nonEuWarningSkippable ?? false;

  const { renderModal: RenderUnsafeModelWarning, safeSetModel } =
    useUnsafeModelWarning<ModelOverride>({
      setModel: setSelectedModel,
      isEuHosted: (model) =>
        model === "automatic" || LLM_META[model]?.hostingLocation === "EU",
      onModalClose: onRequestClose,
      nonEuWarningSkippable,
    });

  const { t } = useTranslation();

  return (
    <>
      <RenderUnsafeModelWarning />
      <Modal open={open} onClose={onRequestClose}>
        <ModalOverflow>
          <ModalDialog
            aria-labelledby="model-dialog-overflow"
            sx={{ width: "70%", maxWidth: "lg", py: 5 }}
          >
            <ModalClose />
            <Typography level="h1" width="100%" textAlign="center">
              {t("chatSettings")}
            </Typography>
            <Typography level="h4" sx={{ mb: 3 }} textAlign="center">
              {t("selectModel")}
            </Typography>
            <div
              className="grid gap-8"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              }}
            >
              {options.map((option) => (
                <ModelCard
                  key={option}
                  defaultModel={defaultModel}
                  selected={
                    selectedModel === option ||
                    ((!selectedModel ||
                      !options.some(
                        (innerOption) => innerOption === selectedModel,
                      )) &&
                      defaultModel === option)
                  }
                  setSelectedModel={setSelectedModel}
                  onChooseUnsafeModel={safeSetModel}
                  onCloseModal={onRequestClose}
                  keyName={option}
                />
              ))}
            </div>
          </ModalDialog>
        </ModalOverflow>
      </Modal>
    </>
  );
}

export function ModelCard({
  selected = true,
  defaultModel,
  setDefaultModel,
  setSelectedModel,
  onChooseUnsafeModel,
  onCloseModal,
  keyName,
}: {
  selected: boolean;
  defaultModel: ModelOverride | null;
  setDefaultModel?: (model: ModelOverride) => void;
  setSelectedModel: (model: ModelOverride) => void;
  onChooseUnsafeModel: (model: ModelOverride) => void;
  onCloseModal?: () => void;
  keyName: ModelOverride;
}) {
  const { t } = useTranslation();
  const meta = keyName === "automatic" ? undefined : LLM_META[keyName];
  const primaryColor = usePrimaryColor();
  const block = (filled: boolean) => (
    <div
      style={{
        border: "1px solid gray ",
        backgroundColor: filled ? primaryColor : "none",
        width: "25px",
        height: "10px",
        display: "inline-block",
        borderRadius: "3px",
      }}
    />
  );
  const isDefault = keyName === defaultModel;
  const [isHovered, setIsHovered] = useState(false);

  //setDefaultModel is only available for General Settings page

  const backgroundColor =
    setDefaultModel && !selected ? "rgb(235,235,235)" : "white";

  const hostedInEU = keyName === "automatic" || meta?.hostingLocation === "EU";

  function getCursor(): "pointer" | "not-allowed" | "default" {
    if (setDefaultModel) {
      return "default";
    }
    return "pointer";
  }

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: backgroundColor,
        cursor: getCursor(),
        ml: 0,
        height: "350px",
        "&:hover": {
          background: setDefaultModel ? backgroundColor : "rgb(245,245,245)",
        },
        outline:
          !setDefaultModel && selected ? "3px solid " + primaryColor : "none",
      }}
      onClick={() => {
        if (!setDefaultModel) {
          if (hostedInEU) {
            setSelectedModel(keyName);
            onCloseModal && onCloseModal();
          } else {
            onChooseUnsafeModel(keyName);
          }
        }
      }}
    >
      {setDefaultModel && (
        <Stack position="absolute" right={10} gap={0.5} alignItems="flex-end">
          <Switch
            checked={selected}
            size="lg"
            sx={{ mr: 0.5, alignSelf: "end" }}
            onClick={() => {
              if (selected || hostedInEU) {
                setSelectedModel(keyName);
                onCloseModal && onCloseModal();
              } else {
                onChooseUnsafeModel(keyName);
              }
            }}
          />
          {isDefault ? (
            <Chip color="primary">{t("default")}</Chip>
          ) : (
            isHovered && (
              <Link
                color="neutral"
                level="body-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDefaultModel?.(keyName);
                  if (!selected) {
                    setSelectedModel(keyName);
                  }
                }}
              >
                {t("default")}
              </Link>
            )
          )}
        </Stack>
      )}
      <Box>
        <Stack direction="row" gap={2}>
          <ModelIcon
            modelName={keyName}
            style={{ height: "60px", width: "auto", marginBottom: "10px" }}
          />
          <Stack>
            <Typography level="h4">{meta?.name ?? t("bestModel")}</Typography>
            {meta && (
              <Typography level="body-md">
                {meta.provider} ({meta.hostingLocation == "EU" ? "🇪🇺" : "🇺🇸"})
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" gap={2}>
          <Stack>
            <Typography level="body-md" sx={{ width: "100%" }}>
              {t("textQuality")}:
            </Typography>
            <Typography level="body-md" sx={{ width: "100%" }}>
              {t("speed")}:
            </Typography>{" "}
          </Stack>
          <Stack justifyContent="space-evenly">
            <Stack
              direction="row"
              gap={1}
              sx={{
                filter: meta == null ? "grayscale(100%)" : "none",
              }}
            >
              {Array.from({ length: 5 }, (_, i) =>
                block(meta == null || i < meta.quality),
              )}
            </Stack>
            <Stack
              direction="row"
              gap={1}
              sx={{
                filter: meta == null ? "grayscale(100%)" : "none",
              }}
            >
              {Array.from({ length: 5 }, (_, i) =>
                block(meta == null || i < meta.speed),
              )}
            </Stack>
          </Stack>
        </Stack>
        <Typography level="body-sm" my={2} width="100%">
          {t("modelMeta." + keyName.replace(".", "-"))}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {meta?.capabilities?.map((capability) => (
            <Chip key={capability}>{capability}</Chip>
          ))}
        </Stack>
        {meta && (
          <Link
            color="neutral"
            onClick={(e) => {
              e.stopPropagation();
            }}
            href={meta.infoUrl}
            target="_blank"
            level="body-xs"
            sx={{
              position: "absolute",
              bottom: 5,
              right: 5,
            }}
          >
            {t("moreInfo")}
          </Link>
        )}
      </Box>
    </Card>
  );
}

export function EnabledModelsSelector({
  availableModels,
  selectedModels,
  updateModel,
  setDefaultModel,
}: MultiModelSelectorProps) {
  const organization = useOrganization();
  const defaultModel = organization?.defaultModel ?? null;
  const selectModel = (key: ModelOverride) => {
    updateModel(key, !selectedModels.includes(key)).catch(() => {
      toast.error("errorDisplay.title");
    });
  };

  const nonEuWarningSkippable = organization?.nonEuWarningSkippable ?? false;

  const { renderModal: RenderUnsafeModelWarning, safeSetModel } =
    useUnsafeModelWarning<ModelOverride>({
      setModel: selectModel,
      isEuHosted: (model) =>
        model === "automatic" || LLM_META[model]?.hostingLocation === "EU",
      nonEuWarningSkippable,
    });
  return (
    <div
      className="grid gap-8"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}
    >
      <RenderUnsafeModelWarning />
      {availableModels.map((key) => (
        <ModelCard
          selected={selectedModels.includes(key)}
          defaultModel={defaultModel}
          setSelectedModel={selectModel}
          onChooseUnsafeModel={safeSetModel}
          key={key}
          keyName={key}
          setDefaultModel={(model) => {
            if (setDefaultModel && model != "automatic") {
              setDefaultModel(model);
            }
          }}
        />
      ))}
    </div>
  );
}
