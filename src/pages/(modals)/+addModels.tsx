import { Check } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Input,
  ModalClose,
  ModalDialog,
  Stack,
  Switch,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import type { ModelProviderGroup } from "@backend/ai/modelProviderGroups";
import RouteModal from "../../components/util/RouteModal";
import { useEnabledChatModelsStore } from "../../lib/context/enabledChatModelsStore";
import { useProviderModels } from "../../lib/api/rust/hooks/useProviderModels";
import { useProviderKeyStatus } from "../../lib/api/rust";
import type { ProviderId } from "../../lib/api/rust/types";
import { toProviderModelId } from "../../lib/provider/modelIds";
import { useTranslation } from "../../lib/i18n";
import { useModals } from "../../router";

const PROVIDER_ORDER: ProviderId[] = [
  "perplexity",
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
];

const PROVIDER_GROUP_LABELS: Record<ProviderId, string> = {
  perplexity: "apiKeysModal.providers.perplexity.name",
  openai: "apiKeysModal.providers.openai.name",
  anthropic: "apiKeysModal.providers.anthropic.name",
  gemini: "apiKeysModal.providers.gemini.name",
  openrouter: "apiKeysModal.providers.openrouter.name",
};

function isStoredKey(
  keyStatus: { id: ProviderId; source: string }[],
  providerId: ProviderId,
) {
  return keyStatus.find((s) => s.id === providerId)?.source === "stored";
}

function ModelToggleRow({
  modelId,
  label,
}: {
  modelId: string;
  label: string;
}) {
  const enabled = useEnabledChatModelsStore((s) => s.isEnabled(modelId));
  const setEnabled = useEnabledChatModelsStore((s) => s.setEnabled);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 1.5,
        py: 1.25,
        borderRadius: "8px",
        "&:hover": { bgcolor: "#f7f7f8" },
      }}
    >
      <Typography
        level="body-sm"
        sx={{ color: "#0d0d0d", fontWeight: 500, minWidth: 0 }}
      >
        {label}
      </Typography>
      <Switch
        checked={enabled}
        onChange={(e) => setEnabled(modelId, e.target.checked)}
        endDecorator={enabled ? <Check sx={{ fontSize: 16 }} /> : null}
        slotProps={{
          input: { "aria-label": label },
        }}
      />
    </Box>
  );
}

function ProviderModelsSection({ provider }: { provider: ProviderId }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: models = [], isLoading, isError, error } = useProviderModels(
    provider,
    true,
  );
  const syncProviderLabels = useEnabledChatModelsStore((s) => s.syncProviderLabels);

  useEffect(() => {
    if (models.length > 0) {
      syncProviderLabels(provider, models);
    }
  }, [models, provider, syncProviderLabels]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [models, search]);

  return (
    <Box>
      <Typography
        level="body-xs"
        sx={{
          px: 1.5,
          pb: 0.5,
          color: "#9b9b9b",
          fontWeight: 600,
          fontSize: "0.6875rem",
          letterSpacing: "0.04em",
        }}
      >
        {t(PROVIDER_GROUP_LABELS[provider])}
      </Typography>
      <Box sx={{ px: 1.5, pb: 1 }}>
        <Input
          size="sm"
          placeholder={t("addModelsModal.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size="sm" />
        </Box>
      )}
      {isError && (
        <Alert variant="soft" color="danger" sx={{ mx: 1.5 }}>
          {(error as Error)?.message ?? t("addModelsModal.fetchFailed")}
        </Alert>
      )}
      {!isLoading && !isError && (
        <Stack spacing={0.25} sx={{ maxHeight: 320, overflowY: "auto" }}>
          {filtered.map((model) => (
            <ModelToggleRow
              key={model.id}
              modelId={toProviderModelId(provider, model.id)}
              label={model.name}
            />
          ))}
          {filtered.length === 0 && (
            <Typography level="body-sm" sx={{ px: 1.5, py: 2, color: "#9b9b9b" }}>
              {t("addModelsModal.noSearchResults")}
            </Typography>
          )}
        </Stack>
      )}
      {!isLoading && !isError && models.length > 0 && (
        <Typography level="body-xs" sx={{ px: 1.5, pt: 1, color: "#9b9b9b" }}>
          {t("addModelsModal.modelCount", { count: models.length })}
        </Typography>
      )}
    </Box>
  );
}

export default function Route() {
  return <AddModelsModal />;
}

function AddModelsModal() {
  const { t } = useTranslation();
  const modals = useModals();
  const { data: keyStatus = [], isPending } = useProviderKeyStatus();

  const configuredProviders = PROVIDER_ORDER.filter((provider) => {
    if (isPending) return false;
    return isStoredKey(keyStatus, provider);
  });

  return (
    <RouteModal>
      <ModalDialog
        sx={{
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "#ffffff",
        }}
      >
        <ModalClose />
        <Typography level="title-lg" sx={{ color: "#0d0d0d", mb: 0.5 }}>
          {t("addModelsModal.title")}
        </Typography>
        <Typography level="body-sm" sx={{ color: "#6e6e80", mb: 2 }}>
          {t("addModelsModal.description")}
        </Typography>

        {configuredProviders.length === 0 ? (
          <Stack spacing={2}>
            <Alert variant="soft" color="neutral">
              {t("addModelsModal.noProviders")}
            </Alert>
            <Button
              variant="outlined"
              onClick={() => {
                modals.close();
                modals.open("/apiKeys");
              }}
            >
              {t("addModelsModal.openApiKeys")}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {configuredProviders.map((provider) => (
              <ProviderModelsSection key={provider} provider={provider} />
            ))}
          </Stack>
        )}
      </ModalDialog>
    </RouteModal>
  );
}
