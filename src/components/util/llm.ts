import { LLM_META, type LlmName } from "@backend/ai/llmMeta";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import { isProviderModelId } from "../../lib/provider/modelIds";

export function isSpecificLLM(model: ModelOverride): model is LlmName {
  return model !== "automatic";
}

export function isCatalogLlmModel(model: string): model is LlmName {
  return (
    model !== "automatic" &&
    !isProviderModelId(model) &&
    model in LLM_META
  );
}