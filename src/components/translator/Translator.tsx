import {
  Close,
  ContentCopy,
  SwapHoriz,
  Translate,
  UploadFile,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Option,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslateText } from "../../lib/api/rust/hooks/useTranslate";
import { useProviderKeyStatus } from "../../lib/api/rust";
import { TARGET_LANGUAGES, TRANSLATE_LANGUAGES } from "../../lib/translate/languages";
import { useTranslation } from "../../lib/i18n";
import { useCopySafe } from "../../lib/hooks/useCopySafe";
import { readTranslationFile } from "../../lib/translate/readTranslationFile";
import { useModals } from "../../router";
import { useToolSessionSync } from "../../lib/hooks/useToolSessionSync";
import {
  archiveTranslatorSession,
  translatorEntryFingerprint,
  translatorSessionFingerprint,
  translatorSessionHasContent,
} from "../../lib/tools/archiveToolSession";
import { historyDisplayName } from "../../lib/tools/historyStorage";
import {
  deleteTranslatorHistoryEntry,
  loadTranslatorHistory,
  renameTranslatorHistoryEntry,
  type TranslatorHistoryEntry,
} from "../../lib/tools/translatorHistory";
import { useToolSessionStore } from "../../lib/tools/toolSessionStore";
import { ToolHistoryDrawer } from "../tools/ToolHistoryDrawer";
import { ToolPageHeader } from "../tools/ToolPageHeader";

const MAX_CHARS = 50_000;
const DEBOUNCE_MS = 700;

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

const selectSx = {
  minWidth: 0,
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
  bgcolor: "transparent",
  fontFamily: panelFont,
} as const;

const textareaSx = {
  flex: 1,
  border: "none",
  borderRadius: 0,
  fontFamily: panelFont,
  "--Textarea-focusedHighlight": "transparent",
  "--Textarea-focusedThickness": "0px",
  bgcolor: "transparent",
  boxShadow: "none",
  "& textarea": {
    minHeight: 280,
    resize: "none",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
} as const;

export function Translator() {
  const { t } = useTranslation();
  const modals = useModals();
  const copy = useCopySafe();
  const { data: keyStatus } = useProviderKeyStatus();
  const { mutateAsync: translate, isPending } = useTranslateText();

  const stored = useToolSessionStore.getState().translator;
  const [tab, setTab] = useState(stored?.tab ?? 0);
  const [sourceLang, setSourceLang] = useState(stored?.sourceLang ?? "auto");
  const [targetLang, setTargetLang] = useState(stored?.targetLang ?? "en");
  const [sourceText, setSourceText] = useState(stored?.sourceText ?? "");
  const [targetText, setTargetText] = useState(stored?.targetText ?? "");
  const [history, setHistory] = useState<TranslatorHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    stored?.activeTabId ?? null,
  );

  const translatorSession = useMemo(
    () => ({
      tab,
      sourceLang,
      targetLang,
      sourceText,
      targetText,
      activeTabId,
    }),
    [tab, sourceLang, targetLang, sourceText, targetText, activeTabId],
  );

  const sessionFingerprint = useMemo(
    () => translatorSessionFingerprint(translatorSession),
    [translatorSession],
  );

  useToolSessionSync(
    "translator",
    translatorSession,
    translatorSessionHasContent(translatorSession),
    sessionFingerprint,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setHistory(loadTranslatorHistory());
  }, []);

  const hasProvider = Boolean(
    keyStatus?.some((k) => k.configured && (k.id === "openrouter" || k.id === "openai")),
  );

  const runTranslate = useCallback(
    async (text: string) => {
      if (!text.trim() || !hasProvider) return;
      try {
        const result = await translate({
          text,
          sourceLanguage: sourceLang === "auto" ? undefined : sourceLang,
          targetLanguage: targetLang,
        });
        setTargetText(result.translatedText);
      } catch (e) {
        console.error(e);
        toast.error(
          e instanceof Error ? e.message : t("translator.translateFailed"),
        );
      }
    },
    [hasProvider, sourceLang, targetLang, translate, t],
  );

  useEffect(() => {
    if (!sourceText.trim()) {
      setTargetText("");
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runTranslate(sourceText);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [sourceText, sourceLang, targetLang, runTranslate]);

  const swapLanguages = () => {
    if (sourceLang === "auto") {
      setSourceLang(targetLang);
      setTargetLang("en");
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    if (targetText.trim()) {
      setSourceText(targetText);
      setTargetText(sourceText);
    }
  };

  const onFileUpload = async (file: File) => {
    try {
      const text = await readTranslationFile(file);
      setSourceText(text.slice(0, MAX_CHARS));
      setTab(0);
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error && e.message === "unsupported"
          ? t("translator.unsupportedFile")
          : e instanceof Error
            ? e.message
            : t("translator.fileReadFailed"),
      );
    }
  };

  const historyItems = useMemo(
    () =>
      history.map((entry) => ({
        id: entry.id,
        title: historyDisplayName(
          entry.name,
          entry.sourceText,
          t("toolHistory.untitled"),
        ),
        createdAt: entry.createdAt,
      })),
    [history, t],
  );

  const resetTab = () => {
    setSourceText("");
    setTargetText("");
    setSourceLang("auto");
    setTargetLang("en");
    setTab(0);
    setActiveTabId(null);
    useToolSessionStore.getState().resetTranslator();
  };

  const handleNewTab = () => {
    const saved = Boolean(archiveTranslatorSession(translatorSession));
    resetTab();
    if (saved) {
      setHistory(loadTranslatorHistory());
      toast.success(t("toolHistory.saved"));
    }
  };

  const handleHistorySelect = (id: string) => {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    setSourceText(entry.sourceText);
    setTargetText(entry.targetText);
    setTab(0);
    setActiveTabId(entry.id);
    const store = useToolSessionStore.getState();
    store.setTranslatorBaseline(translatorEntryFingerprint(entry));
    store.setTranslatorDirty(false);
    setHistoryOpen(false);
  };

  const handleHistoryRename = (id: string, name: string) => {
    setHistory(renameTranslatorHistoryEntry(id, name));
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(deleteTranslatorHistoryEntry(id));
    if (activeTabId === id) setActiveTabId(null);
    toast.success(t("toolHistory.deleted"));
  };

  if (!hasProvider) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
        <Translate sx={{ fontSize: 48, color: "#9b9b9b" }} />
        <Typography level="h4" sx={{ fontFamily: panelFont }}>
          {t("translator.title")}
        </Typography>
        <Typography
          level="body-md"
          textAlign="center"
          sx={{ maxWidth: 420, fontFamily: panelFont }}
        >
          {t("translator.noApiKey")}
        </Typography>
        <Button
          onClick={() => modals.open("/apiKeys")}
          sx={{ bgcolor: "#0d0d0d", "&:hover": { bgcolor: "#353740" } }}
        >
          {t("apiKeysModal.title")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      style={{ fontFamily: panelFont }}
    >
      <ToolPageHeader
        icon={<Translate sx={{ fontSize: 22 }} />}
        title={t("translator.title")}
        onNewTab={handleNewTab}
        onOpenHistory={() => setHistoryOpen(true)}
        trailing={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography level="body-sm" textColor="neutral.500">
              {t("translator.glossary")}
            </Typography>
            <Select size="sm" value="none" disabled sx={{ ...selectSx, width: 120 }}>
              <Option value="none">{t("translator.glossaryNone")}</Option>
            </Select>
          </Box>
        }
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v as number)}
          sx={{
            bgcolor: "transparent",
            "& .Mui-selected": { color: "#0d0d0d !important" },
            "& .MuiTab-indicator": { bgcolor: "#0d0d0d" },
          }}
        >
          <TabList sx={{ mb: 2, gap: 2 }}>
            <Tab sx={{ fontFamily: panelFont, fontWeight: 500 }}>
              {t("translator.translateText")}
            </Tab>
            <Tab sx={{ fontFamily: panelFont, fontWeight: 500 }}>
              {t("translator.translateFile")}
            </Tab>
          </TabList>

          <TabPanel value={0} sx={{ p: 0, flex: 1, overflow: "hidden" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 420,
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr auto 1fr" },
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid #ececf1",
                }}
              >
                <Select
                  size="sm"
                  value={sourceLang}
                  onChange={(_e, v) => v && setSourceLang(v)}
                  sx={{ ...selectSx, minWidth: 0 }}
                >
                  {TRANSLATE_LANGUAGES.map((lang) => (
                    <Option key={lang.code} value={lang.code}>
                      {t(lang.labelKey)}
                    </Option>
                  ))}
                </Select>
                <IconButton
                  size="sm"
                  variant="outlined"
                  onClick={swapLanguages}
                  sx={{ borderColor: "#e5e5e5", borderRadius: "8px", justifySelf: "center" }}
                >
                  <SwapHoriz />
                </IconButton>
                <Select
                  size="sm"
                  value={targetLang}
                  onChange={(_e, v) => v && setTargetLang(v)}
                  sx={{ ...selectSx, minWidth: 0 }}
                >
                  {TARGET_LANGUAGES.map((lang) => (
                    <Option key={lang.code} value={lang.code}>
                      {t(lang.labelKey)}
                    </Option>
                  ))}
                </Select>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", lg: "row" },
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    borderRight: { lg: "1px solid #ececf1" },
                    borderBottom: { xs: "1px solid #ececf1", lg: "none" },
                  }}
                >
                  <Textarea
                    placeholder={t("translator.sourcePlaceholder")}
                    value={sourceText}
                    onChange={(e) =>
                      setSourceText(e.target.value.slice(0, MAX_CHARS))
                    }
                    sx={textareaSx}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography level="body-xs" textColor="neutral.500">
                      {sourceText.length.toLocaleString()} /{" "}
                      {MAX_CHARS.toLocaleString()}
                    </Typography>
                    <IconButton
                      size="sm"
                      variant="plain"
                      disabled={!sourceText}
                      onClick={() => {
                        setSourceText("");
                        setTargetText("");
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Textarea
                    placeholder={
                      isPending
                        ? t("translator.translating")
                        : t("translator.targetPlaceholder")
                    }
                    value={targetText}
                    readOnly
                    sx={{
                      ...textareaSx,
                      "& textarea": {
                        minHeight: 280,
                        resize: "none",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: isPending ? "#9b9b9b" : "#0d0d0d",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography
                      level="body-xs"
                      textColor="neutral.500"
                      sx={{ fontStyle: "italic" }}
                    >
                      {t("translator.alternativesHint")}
                    </Typography>
                    <IconButton
                      size="sm"
                      variant="plain"
                      disabled={!targetText}
                      onClick={() => copy(targetText)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={1} sx={{ p: 0 }}>
            <Box
              sx={{
                border: "1px dashed #d4d4d4",
                borderRadius: "12px",
                p: 4,
                textAlign: "center",
                bgcolor: "#fafafa",
              }}
            >
              <UploadFile sx={{ fontSize: 40, color: "#9b9b9b", mb: 1 }} />
              <Typography level="body-md" sx={{ mb: 1 }}>
                {t("translator.fileUploadHint")}
              </Typography>
              <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
                {t("translator.fileFormats")}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                sx={{ borderColor: "#e5e5e5" }}
              >
                {t("translator.chooseFile")}
                <input
                  type="file"
                  hidden
                  accept=".txt,.md,.csv,.pdf,text/plain,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onFileUpload(file);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Box>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
