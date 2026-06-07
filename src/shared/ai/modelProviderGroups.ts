import type { LlmName } from "./llmMeta.js";
import { LLM_META } from "./llmMeta.js";

export type ModelProviderGroup =
  | "perplexity"
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter";

const GROUP_ORDER: ModelProviderGroup[] = [
  "perplexity",
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
];

export function getModelProviderGroup(model: LlmName): ModelProviderGroup {
  if (model.startsWith("sonar")) return "perplexity";
  if (
    model.includes("gpt") ||
    model.startsWith("o1") ||
    model.startsWith("o3")
  ) {
    return "openai";
  }
  if (model.includes("claude")) return "anthropic";
  if (model.includes("gemini")) return "gemini";
  return "openrouter";
}

export function groupModelsByProvider(
  models: LlmName[],
): { group: ModelProviderGroup; models: LlmName[] }[] {
  const buckets = new Map<ModelProviderGroup, LlmName[]>();
  for (const model of models) {
    const group = getModelProviderGroup(model);
    const list = buckets.get(group) ?? [];
    list.push(model);
    buckets.set(group, list);
  }
  return GROUP_ORDER.filter((g) => buckets.has(g)).map((group) => ({
    group,
    models: buckets.get(group)!,
  }));
}

export function getAllChatModelsByProvider(): {
  group: ModelProviderGroup;
  models: LlmName[];
}[] {
  const chatModels = (Object.keys(LLM_META) as LlmName[]).filter(
    (model) => LLM_META[model]?.allowChat,
  );
  return groupModelsByProvider(chatModels);
}
