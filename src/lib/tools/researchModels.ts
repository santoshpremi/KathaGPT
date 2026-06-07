import type { ProviderModel } from "../api/rust/providerModels";
import type { ProviderId, ProviderKeyStatus } from "../api/rust/types";
import { toProviderModelId } from "../provider/modelIds";

export type ResearchProviderGroup = "perplexity" | "openrouter";

export interface ResearchModelOption {
  id: string;
  label: string;
  providerGroup: ResearchProviderGroup;
  isDeepResearch: boolean;
}

const GROUP_ORDER: ResearchProviderGroup[] = ["perplexity", "openrouter"];

/** Curated Perplexity online research models (matches Rust provider_models.rs). */
const PERPLEXITY_RESEARCH_CATALOG: ProviderModel[] = [
  { id: "sonar", name: "Sonar", description: "Fast online answers" },
  { id: "sonar-pro", name: "Sonar Pro", description: "Advanced online research" },
  {
    id: "sonar-reasoning",
    name: "Sonar Reasoning",
    description: "Reasoning with web search",
  },
  {
    id: "sonar-reasoning-pro",
    name: "Sonar Reasoning Pro",
    description: "Deep reasoning with web search",
  },
  {
    id: "sonar-deep-research",
    name: "Sonar Deep Research",
    description: "Exhaustive research reports",
  },
];

export function hasStoredProviderKey(
  keyStatus: ProviderKeyStatus[] | undefined,
  provider: ProviderId,
): boolean {
  return keyStatus?.find((entry) => entry.id === provider)?.source === "stored";
}

export function researchSlug(modelId: string): string {
  const colon = modelId.indexOf(":");
  const raw = colon >= 0 ? modelId.slice(colon + 1) : modelId;
  const slash = raw.lastIndexOf("/");
  return slash >= 0 ? raw.slice(slash + 1) : raw;
}

export function isResearchModelSlug(slug: string): boolean {
  return slug.toLowerCase().includes("sonar");
}

export function isDeepResearchSlug(slug: string): boolean {
  const normalized = slug.toLowerCase();
  return (
    normalized.includes("deep-research") || normalized.includes("reasoning-pro")
  );
}

export function isOpenRouterResearchModel(openRouterId: string): boolean {
  const id = openRouterId.toLowerCase();
  return id.startsWith("perplexity/") && id.includes("sonar");
}

export function buildResearchModelOptions(
  keyStatus: ProviderKeyStatus[] | undefined,
  perplexityModels?: ProviderModel[],
  openrouterModels?: ProviderModel[],
): ResearchModelOption[] {
  const options: ResearchModelOption[] = [];

  if (hasStoredProviderKey(keyStatus, "perplexity")) {
    const catalog = (perplexityModels ?? PERPLEXITY_RESEARCH_CATALOG).filter(
      (model) => isResearchModelSlug(model.id),
    );
    for (const model of catalog) {
      options.push({
        id: toProviderModelId("perplexity", model.id),
        label: model.name,
        providerGroup: "perplexity",
        isDeepResearch: isDeepResearchSlug(model.id),
      });
    }
  }

  if (hasStoredProviderKey(keyStatus, "openrouter")) {
    const fromApi = (openrouterModels ?? []).filter((model) =>
      isOpenRouterResearchModel(model.id),
    );
    const catalog =
      fromApi.length > 0
        ? fromApi
        : PERPLEXITY_RESEARCH_CATALOG.map((model) => ({
            id: `perplexity/${model.id}`,
            name: `Perplexity: ${model.name}`,
            description: model.description,
          }));

    for (const model of catalog) {
      options.push({
        id: toProviderModelId("openrouter", model.id),
        label: model.name,
        providerGroup: "openrouter",
        isDeepResearch: isDeepResearchSlug(researchSlug(model.id)),
      });
    }
  }

  return options;
}

export function groupResearchModelOptions(
  options: ResearchModelOption[],
): { group: ResearchProviderGroup; models: ResearchModelOption[] }[] {
  const buckets = new Map<ResearchProviderGroup, ResearchModelOption[]>();
  for (const option of options) {
    const list = buckets.get(option.providerGroup) ?? [];
    list.push(option);
    buckets.set(option.providerGroup, list);
  }
  return GROUP_ORDER.filter((group) => buckets.has(group)).map((group) => ({
    group,
    models: buckets.get(group)!,
  }));
}

export function hasResearchCapability(
  keyStatus: ProviderKeyStatus[] | undefined,
  perplexityModels?: ProviderModel[],
  openrouterModels?: ProviderModel[],
): boolean {
  return (
    hasStoredProviderKey(keyStatus, "perplexity") ||
    hasStoredProviderKey(keyStatus, "openrouter")
  );
}

export function defaultResearchModel(
  options: ResearchModelOption[],
): string | null {
  const quickSonar = options.find(
    (option) =>
      !option.isDeepResearch &&
      researchSlug(option.id).toLowerCase() === "sonar",
  );
  if (quickSonar) return quickSonar.id;

  const anyQuick = options.find((option) => !option.isDeepResearch);
  return anyQuick?.id ?? options[0]?.id ?? null;
}
