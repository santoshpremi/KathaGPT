import {
  AutoFixHigh,
  Download,
  ImageOutlined,
  Wallpaper,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Option,
  Select,
  Slider,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useModals } from "../../router";
import {
  useGenerateImages,
  useImageModels,
  useImproveImagePrompt,
} from "../../lib/api/rust/hooks/useImages";
import { useProviderKeyStatus } from "../../lib/api/rust";
import type { ImageModel } from "../../lib/api/rust/images";
import { useTranslation } from "../../lib/i18n";
import { useToolSessionSync } from "../../lib/hooks/useToolSessionSync";
import {
  archiveImageSession,
  imageEntryFingerprint,
  imageSessionFingerprint,
  imageSessionHasContent,
} from "../../lib/tools/archiveToolSession";
import { historyDisplayName } from "../../lib/tools/historyStorage";
import {
  deleteImageHistoryEntry,
  loadImageHistory,
  renameImageHistoryEntry,
  type ImageHistoryEntry,
} from "../../lib/imageGenerator/history";
import { useToolSessionStore } from "../../lib/tools/toolSessionStore";
import { ToolHistoryDrawer } from "../tools/ToolHistoryDrawer";
import { ToolPageHeader } from "../tools/ToolPageHeader";
import { DelayedLoader } from "../util/DelayedLoader";

const STYLES = [
  { id: "none", labelKey: "imageGenerator.styles.none" },
  { id: "realistic", labelKey: "imageGenerator.styles.realistic" },
  { id: "minimalist", labelKey: "imageGenerator.styles.minimalist" },
  { id: "illustration", labelKey: "imageGenerator.styles.illustration" },
  { id: "logo", labelKey: "imageGenerator.styles.logo" },
  { id: "product", labelKey: "imageGenerator.styles.product" },
  { id: "mockup", labelKey: "imageGenerator.styles.mockup" },
  { id: "social", labelKey: "imageGenerator.styles.social" },
  { id: "stock", labelKey: "imageGenerator.styles.stock" },
  { id: "advertising", labelKey: "imageGenerator.styles.advertising" },
  { id: "interior", labelKey: "imageGenerator.styles.interior" },
  { id: "memphis", labelKey: "imageGenerator.styles.memphis" },
  { id: "ui", labelKey: "imageGenerator.styles.ui" },
] as const;

const ASPECTS = [
  { id: "square", labelKey: "imageGenerator.aspect.square" },
  { id: "landscape", labelKey: "imageGenerator.aspect.landscape" },
  { id: "portrait", labelKey: "imageGenerator.aspect.portrait" },
] as const;

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

const selectSx = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  borderRadius: "10px",
  border: "1px solid #e5e5e5",
  bgcolor: "#ffffff",
  fontFamily: panelFont,
  "&:hover": { bgcolor: "#fafafa" },
} as const;

const segmentBtnSx = (active: boolean) =>
  ({
    flex: 1,
    borderRadius: "8px",
    border: `1px solid ${active ? "#0d0d0d" : "#e5e5e5"}`,
    bgcolor: active ? "#0d0d0d" : "#ffffff",
    color: active ? "#ffffff" : "#0d0d0d",
    fontWeight: 500,
    fontSize: "0.8125rem",
    "&:hover": {
      bgcolor: active ? "#353740" : "#f7f7f8",
    },
  }) as const;

function downloadImage(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

export function ImageGenerator() {
  const { t } = useTranslation();
  const modals = useModals();
  const { data: keyStatus } = useProviderKeyStatus();
  const {
    data: models,
    isLoading: modelsLoading,
    isError: modelsError,
    refetch: refetchModels,
  } = useImageModels();

  const hasImageProvider = Boolean(
    keyStatus?.some((k) => k.configured && (k.id === "openrouter" || k.id === "openai")),
  );
  const { mutateAsync: generate, isPending: generating } = useGenerateImages();
  const { mutateAsync: improvePrompt, isPending: improving } =
    useImproveImagePrompt();

  const storedImage = useToolSessionStore.getState().image;
  const [modelId, setModelId] = useState(storedImage?.modelId ?? "");
  const [style, setStyle] = useState(storedImage?.style ?? "none");
  const [prompt, setPrompt] = useState(storedImage?.prompt ?? "");
  const [aspect, setAspect] = useState(storedImage?.aspect ?? "square");
  const [count, setCount] = useState(storedImage?.count ?? 1);
  const [results, setResults] = useState<string[]>(storedImage?.results ?? []);
  const [history, setHistory] = useState<ImageHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    storedImage?.activeTabId ?? null,
  );

  const imageSession = useMemo(
    () => ({
      modelId,
      style,
      prompt,
      aspect,
      count,
      results,
      activeTabId,
    }),
    [modelId, style, prompt, aspect, count, results, activeTabId],
  );

  const sessionFingerprint = useMemo(
    () => imageSessionFingerprint(imageSession),
    [imageSession],
  );

  useToolSessionSync(
    "image",
    imageSession,
    imageSessionHasContent(imageSession),
    sessionFingerprint,
  );

  const selectedModel = useMemo(
    () => models?.find((m) => m.id === modelId),
    [models, modelId],
  );

  useEffect(() => {
    if (!models?.length) return;
    if (!modelId || !models.some((m) => m.id === modelId)) {
      setModelId(models[0].id);
    }
  }, [models, modelId]);

  useEffect(() => {
    setHistory(loadImageHistory());
  }, []);

  const canGenerate = Boolean(modelId && prompt.trim() && models?.length);

  const historyItems = useMemo(
    () =>
      history.map((entry) => ({
        id: entry.id,
        title: historyDisplayName(
          entry.name,
          entry.prompt,
          t("toolHistory.untitled"),
        ),
        createdAt: entry.createdAt,
      })),
    [history, t],
  );

  const resetTab = () => {
    setPrompt("");
    setResults([]);
    setStyle("none");
    setCount(1);
    setActiveTabId(null);
    useToolSessionStore.getState().resetImage();
  };

  const handleNewTab = () => {
    const saved = Boolean(archiveImageSession(imageSession));
    resetTab();
    if (saved) {
      setHistory(loadImageHistory());
      toast.success(t("toolHistory.saved"));
    }
  };

  const handleHistorySelect = (id: string) => {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    setPrompt(entry.prompt);
    setModelId(entry.model);
    setStyle(entry.style);
    setAspect(entry.aspectRatio);
    setResults(entry.images);
    setActiveTabId(entry.id);
    const store = useToolSessionStore.getState();
    store.setImageBaseline(imageEntryFingerprint(entry));
    store.setImageDirty(false);
    setHistoryOpen(false);
  };

  const handleHistoryRename = (id: string, name: string) => {
    setHistory(renameImageHistoryEntry(id, name));
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(deleteImageHistoryEntry(id));
    if (activeTabId === id) setActiveTabId(null);
    toast.success(t("toolHistory.deleted"));
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    try {
      const images = await generate({
        model: modelId,
        prompt: prompt.trim(),
        style: style !== "none" ? style : undefined,
        aspectRatio: aspect,
        count,
      });
      const urls = images.map((img) => img.url);
      setResults(urls);
      toast.success(t("imageGenerator.generated"));
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : t("imageGenerator.generateFailed"),
      );
    }
  };

  const handleImprove = async () => {
    if (!prompt.trim()) return;
    try {
      const { prompt: improved } = await improvePrompt(prompt.trim());
      setPrompt(improved);
      toast.success(t("imageGenerator.promptImproved"));
    } catch (e) {
      console.error(e);
      toast.error(t("imageGenerator.improveFailed"));
    }
  };

  if (modelsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <DelayedLoader />
      </div>
    );
  }

  if (!models?.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
        <Wallpaper sx={{ fontSize: 48, color: "#9b9b9b" }} />
        <Typography level="h4">{t("imageGenerator.title")}</Typography>
        <Typography level="body-md" textAlign="center" sx={{ maxWidth: 420 }}>
          {hasImageProvider
            ? t("imageGenerator.modelsLoadFailed")
            : t("imageGenerator.noApiKey")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {hasImageProvider ? (
            <Button
              onClick={() => void refetchModels()}
              sx={{ bgcolor: "#0d0d0d", "&:hover": { bgcolor: "#353740" } }}
            >
              {t("imageGenerator.retry")}
            </Button>
          ) : (
            <Button
              onClick={() => modals.open("/apiKeys")}
              sx={{ bgcolor: "#0d0d0d", "&:hover": { bgcolor: "#353740" } }}
            >
              {t("apiKeysModal.title")}
            </Button>
          )}
          {modelsError && (
            <Button variant="outlined" onClick={() => modals.open("/apiKeys")}>
              {t("apiKeysModal.title")}
            </Button>
          )}
        </Box>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      style={{ fontFamily: panelFont }}
    >
      <ToolPageHeader
        icon={<Wallpaper sx={{ fontSize: 22 }} />}
        title={t("imageGenerator.title")}
        onNewTab={handleNewTab}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      <ToolHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        entries={historyItems}
        selectedId={activeTabId}
        onSelect={handleHistorySelect}
        onRename={handleHistoryRename}
        onDelete={handleHistoryDelete}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 lg:flex-row lg:items-start">
        <Card
          variant="outlined"
          sx={{
            flexShrink: 0,
            width: "100%",
            minWidth: 0,
            maxWidth: { xs: "100%", lg: 400 },
            p: 2.5,
            borderColor: "#e5e5e5",
            borderRadius: "16px",
            gap: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 600 }}>
              {t("imageGenerator.model")}
            </Typography>
            <Select
              size="sm"
              value={modelId}
              onChange={(_e, v) => v && setModelId(v)}
              sx={selectSx}
              slotProps={{
                listbox: { sx: { maxWidth: 360 } },
              }}
            >
              {models.map((m: ImageModel) => (
                <Option key={m.id} value={m.id}>
                  {m.name}
                </Option>
              ))}
            </Select>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography level="body-xs" sx={{ mb: 0.5, fontWeight: 600 }}>
              {t("imageGenerator.style")}
            </Typography>
            <Select
              size="sm"
              value={style}
              onChange={(_e, v) => v && setStyle(v)}
              sx={selectSx}
            >
              {STYLES.map((s) => (
                <Option key={s.id} value={s.id}>
                  {t(s.labelKey)}
                </Option>
              ))}
            </Select>
          </Box>

          {selectedModel?.description && (
            <Typography
              level="body-xs"
              textColor="neutral.500"
              sx={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {selectedModel.description}
            </Typography>
          )}

          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography level="body-xs" sx={{ fontWeight: 600 }}>
                {t("imageGenerator.prompt")}
              </Typography>
              <Button
                size="sm"
                variant="plain"
                startDecorator={<AutoFixHigh sx={{ fontSize: 16 }} />}
                loading={improving}
                disabled={!prompt.trim()}
                onClick={() => void handleImprove()}
                sx={{ color: "#6e6e80" }}
              >
                {t("imageGenerator.improvePrompt")}
              </Button>
            </Box>
            <Textarea
              minRows={4}
              placeholder={t("imageGenerator.promptPlaceholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{
                borderRadius: "12px",
                border: "1px solid #e5e5e5",
                "--Textarea-focusedHighlight": "transparent",
                "--Textarea-focusedThickness": "0px",
                "&:focus-within": { borderColor: "#d4d4d4" },
              }}
            />
          </Box>

          <Box>
            <Typography level="body-xs" sx={{ mb: 1, fontWeight: 600 }}>
              {t("imageGenerator.count", { count })}
            </Typography>
            <Slider
              value={count}
              min={1}
              max={4}
              step={1}
              onChange={(_e, v) => setCount(v as number)}
              sx={{ color: "#0d0d0d" }}
            />
          </Box>

          <Box>
            <Typography level="body-xs" sx={{ mb: 1, fontWeight: 600 }}>
              {t("imageGenerator.aspectRatio")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {ASPECTS.map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant="plain"
                  onClick={() => setAspect(a.id)}
                  sx={segmentBtnSx(aspect === a.id)}
                >
                  {t(a.labelKey)}
                </Button>
              ))}
            </Box>
          </Box>

          <Button
            fullWidth
            size="lg"
            loading={generating}
            disabled={!canGenerate}
            onClick={() => void handleGenerate()}
            sx={{
              mt: 1,
              borderRadius: "12px",
              bgcolor: "#0d0d0d",
              "&:hover": { bgcolor: "#353740" },
              "&:disabled": { bgcolor: "#ececf1", color: "#6e6e80" },
            }}
          >
            {t("imageGenerator.generate")}
          </Button>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 360,
            p: 3,
            borderColor: "#e5e5e5",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography level="title-md" sx={{ mb: 0.5 }}>
            {t("imageGenerator.preview")}
          </Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
            {t("imageGenerator.previewHint")}
          </Typography>

          {results.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f7f7f8",
                borderRadius: "12px",
                border: "1px dashed #e5e5e5",
                gap: 1,
                minHeight: 280,
              }}
            >
              <ImageOutlined sx={{ fontSize: 48, color: "#c5c5d0" }} />
              <Typography level="body-sm" textColor="neutral.500">
                {t("imageGenerator.emptyPreview")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  results.length === 1 ? "1fr" : "repeat(2, 1fr)",
                gap: 2,
                flex: 1,
              }}
            >
              {results.map((url, i) => (
                <Box
                  key={`${url.slice(0, 32)}-${i}`}
                  sx={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e5e5e5",
                    bgcolor: "#f7f7f8",
                  }}
                >
                  <img
                    src={url}
                    alt={t("imageGenerator.generatedAlt", { index: i + 1 })}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      maxHeight: 420,
                    }}
                  />
                  <Button
                    size="sm"
                    variant="soft"
                    startDecorator={<Download />}
                    onClick={() => downloadImage(url, `kathgpt-image-${i + 1}.png`)}
                    sx={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      bgcolor: "rgba(255,255,255,0.92)",
                    }}
                  >
                    {t("imageGenerator.download")}
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          {generating && (
            <Alert variant="soft" color="neutral" sx={{ mt: 2 }}>
              {t("imageGenerator.generating")}
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}
