import { ContentCopy, Delete } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemContent,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import RouteModal from "../../components/util/RouteModal";
import {
  useClearProviderKey,
  useProviderKeyStatus,
  useSetProviderKey,
  useTestProviderConnection,
} from "../../lib/api/rust";
import {
  useCreateDeveloperApiKey,
  useDeleteDeveloperApiKey,
  useDeveloperApiKeys,
} from "../../lib/api/localHooks";
import { useCopySafe } from "../../lib/hooks/useCopySafe";
import { ConfirmModal } from "../../components/sidebar/tree/ConfirmModal";

const PROVIDER_IDS = [
  "openrouter",
  "openai",
  "anthropic",
  "gemini",
  "perplexity",
] as const;

type ProviderId = (typeof PROVIDER_IDS)[number];

export default function Route() {
  return <ApiKeysModal />;
}

function ProviderKeyRow({ provider }: { provider: ProviderId }) {
  const { t } = useTranslation();
  const [draftKey, setDraftKey] = useState("");

  const { data: statuses, refetch } = useProviderKeyStatus();
  const status = statuses?.find((s) => s.id === provider);

  const { mutateAsync: setKey, isPending: saving } = useSetProviderKey();
  const { mutateAsync: clearKey, isPending: clearing } = useClearProviderKey();
  const { mutateAsync: testConnection, isPending: testing } =
    useTestProviderConnection();

  const needsResave = status?.source === "corrupt";
  const configured = (status?.configured ?? false) && !needsResave;
  const sourceLabel =
    status?.source === "env"
      ? t("apiKeysModal.fromEnv")
      : status?.source === "stored"
        ? t("apiKeysModal.fromSettings")
        : null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "sm",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <Box>
            <Typography level="title-md">
              {t(`apiKeysModal.providers.${provider}.name`)}
            </Typography>
            <Typography level="body-sm" textColor="neutral.500">
              {t(`apiKeysModal.providers.${provider}.description`)}
            </Typography>
          </Box>
          <Chip
            size="sm"
            variant="soft"
            color={configured ? "success" : "neutral"}
          >
            {configured
              ? t("apiKeysModal.configured")
              : t("apiKeysModal.notConfigured")}
          </Chip>
        </Stack>

        {needsResave && (
          <Alert variant="soft" color="warning">
            {t("apiKeysModal.needsResave")}
          </Alert>
        )}

        {status?.maskedKey && !needsResave && (
          <Typography level="body-sm">
            {t("apiKeysModal.maskedKey")}:{" "}
            <Typography component="span" fontFamily="monospace">
              {status.maskedKey}
            </Typography>
            {sourceLabel && (
              <Typography component="span" textColor="neutral.500">
                {" "}
                ({sourceLabel})
              </Typography>
            )}
          </Typography>
        )}

        <FormControl>
          <Input
            type="password"
            placeholder={t("apiKeysModal.apiKeyPlaceholder")}
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            disabled={saving || clearing}
          />
        </FormControl>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="sm"
            disabled={draftKey.length < 8}
            loading={saving}
            onClick={async () => {
              await setKey({ provider, apiKey: draftKey });
              setDraftKey("");
              void refetch();
              toast.success(t("apiKeysModal.keySaved"));
            }}
          >
            {t("save")}
          </Button>
          <Button
            size="sm"
            variant="outlined"
            loading={testing}
            disabled={!configured && draftKey.length < 8}
            onClick={async () => {
              const result = await testConnection({
                provider,
                apiKey: draftKey.length >= 8 ? draftKey : undefined,
              });
              if (result.ok) {
                toast.success(result.message || t("apiKeysModal.testSuccess"));
              } else {
                toast.error(result.message || t("apiKeysModal.testFailed"));
              }
            }}
          >
            {t("apiKeysModal.testConnection")}
          </Button>
          {(configured || needsResave) && status?.source !== "env" && (
            <Button
              size="sm"
              variant="plain"
              color="danger"
              loading={clearing}
              onClick={async () => {
                await clearKey({ provider });
                void refetch();
                toast.success(t("apiKeysModal.keyCleared"));
              }}
            >
              {t("apiKeysModal.clearKey")}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function ApiKeysModal() {
  const { t } = useTranslation();

  const copy = useCopySafe();

  const [newKeyName, setNewKeyName] = useState("");

  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const { data: apiKeys } = useDeveloperApiKeys();
  const {
    mutateAsync: createKey,
    data: createdApiKey,
    isPending: createKeyPending,
  } = useCreateDeveloperApiKey();

  const {
    mutateAsync: deleteKey,
    isPending: deleteKeyPending,
    variables: deletingKeyVariables,
  } = useDeleteDeveloperApiKey();

  return (
    <>
      <ConfirmModal
        open={!!deletingKey}
        onClose={() => setDeletingKey(null)}
        onSure={async () => {
          await deleteKey(deletingKey!);
          toast.success("API key deleted");
        }}
      />
      <RouteModal>
        <ModalDialog sx={{ maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
          <ModalClose />
          <Typography id="api-key-modal-title" level="title-lg">
            {t("apiKeysModal.title")}
          </Typography>
          <Stack spacing={2} mb={2}>
            <Typography id="api-key-modal-description" level="body-md">
              {t("apiKeysModal.description")}
            </Typography>
            <Alert variant="soft" color="primary">
              {t("apiKeysModal.priorityNote")}
            </Alert>

            <Typography level="title-sm">{t("apiKeysModal.providerSection")}</Typography>
            <Stack spacing={2}>
              {PROVIDER_IDS.map((provider) => (
                <ProviderKeyRow key={provider} provider={provider} />
              ))}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography level="title-sm">{t("apiKeysModal.developerSection")}</Typography>
            <Typography level="body-sm" textColor="neutral.500">
              {t("apiKeysModal.developerDescription")}
            </Typography>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createKey({ displayName: newKeyName });
                setNewKeyName("");
                toast.success(t("apiKeysModal.keyCreated"));
              }}
            >
              <Input
                placeholder={t("apiKeysModal.keyNamePlaceholder")}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={createKeyPending}
                endDecorator={
                  <Button
                    type="submit"
                    disabled={!newKeyName.length}
                    loading={createKeyPending}
                  >
                    {t("create")}
                  </Button>
                }
              />
            </form>
            {createdApiKey && (
              <Stack spacing={2} alignItems="center">
                <FormControl className="w-full">
                  <FormLabel>{t("apiKeysModal.newKeyLabel")}</FormLabel>
                  <Input
                    fullWidth
                    value={createdApiKey.key}
                    readOnly
                    endDecorator={
                      <IconButton
                        size="sm"
                        onClick={() => createdApiKey.key && copy(createdApiKey.key)}
                      >
                        <ContentCopy />
                      </IconButton>
                    }
                  />
                </FormControl>
                <Alert color="warning" variant="soft">
                  {t("apiKeysModal.newKeyCopyReminder")}
                </Alert>
              </Stack>
            )}
          </Stack>
          <Divider />
          <List>
            {apiKeys &&
              apiKeys.map((key) => (
                <ListItem
                  key={key.id}
                  endAction={
                    <IconButton
                      aria-label="Delete"
                      size="sm"
                      color="danger"
                      loading={
                        !!(
                          deleteKeyPending &&
                          deletingKeyVariables === key.id
                        )
                      }
                      onClick={() => setDeletingKey(key.id)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemContent>
                    <Typography>{key.displayName}</Typography>
                  </ListItemContent>
                </ListItem>
              ))}
          </List>
        </ModalDialog>
      </RouteModal>
    </>
  );
}
