import { Select, Option, Button } from "@mui/joy";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  type LlmName,
  LLM_META,
} from "@backend/ai/llmMeta";
import { useEnabledModels } from "../../../../../../lib/api/rust";
import { ModelIcon } from "../../../../../../lib/ModelIcon";
import { useNewChat } from "../../../../../../lib/hooks/useNewChat";

export function ContextLengthActions({
  errorCodeDetails,
  switchToModel,
}: {
  errorCodeDetails: string;
  switchToModel: (model: LlmName) => void;
}) {
  const { t } = useTranslation();
  const { startNewChat } = useNewChat();

  const { data: enabledModels } = useEnabledModels();

  const chatContextTokens = parseInt(errorCodeDetails ?? "0", 10) || 0;
  const largerModels: LlmName[] = (enabledModels ?? [])
    .filter(
      (model) =>
        LLM_META[model].allowChat &&
        LLM_META[model].contextWindow >= chatContextTokens,
    )
    .sort();

  return (
    <div className="flex items-center gap-3">
      {largerModels.length > 0 && (
        <Select variant="outlined" placeholder={t("switchToLargerModel")}>
          {largerModels.map((model) => (
            <Option
              key={model}
              onClick={() => {
                switchToModel(model);
              }}
              value={model}
            >
              <div className="space-between flex">
                {LLM_META[model].name}
                <ModelIcon modelName={model} className="ml-2 h-5 w-5" />
              </div>
            </Option>
          ))}
        </Select>
      )}
      <Typography>{t("or")}</Typography>
      <Button onClick={() => void startNewChat()}>{t("newChat")}</Button>
    </div>
  );
}
