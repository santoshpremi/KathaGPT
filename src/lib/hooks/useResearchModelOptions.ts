import { useMemo } from "react";
import { useProviderKeyStatus } from "../api/rust";
import { useProviderModels } from "../api/rust/hooks/useProviderModels";
import {
  buildResearchModelOptions,
  groupResearchModelOptions,
  hasResearchCapability,
} from "../tools/researchModels";

export function useResearchModelOptions() {
  const { data: keyStatus } = useProviderKeyStatus();

  const hasPerplexityStored = useMemo(
    () => keyStatus?.find((k) => k.id === "perplexity")?.source === "stored",
    [keyStatus],
  );
  const hasOpenRouterStored = useMemo(
    () => keyStatus?.find((k) => k.id === "openrouter")?.source === "stored",
    [keyStatus],
  );

  const { data: perplexityModels } = useProviderModels(
    "perplexity",
    Boolean(hasPerplexityStored),
  );
  const { data: openrouterModels } = useProviderModels(
    "openrouter",
    Boolean(hasOpenRouterStored),
  );

  const options = useMemo(
    () =>
      buildResearchModelOptions(
        keyStatus,
        perplexityModels,
        openrouterModels,
      ),
    [keyStatus, perplexityModels, openrouterModels],
  );

  const grouped = useMemo(() => groupResearchModelOptions(options), [options]);

  const hasProvider = hasResearchCapability(
    keyStatus,
    perplexityModels,
    openrouterModels,
  );

  return { options, grouped, hasProvider, keyStatus };
}
