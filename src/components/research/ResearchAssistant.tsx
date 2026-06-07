import { Language, Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Option,
  Select,
  Textarea,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useResearchQuery } from "../../lib/api/rust/hooks/useResearch";
import type { ResearchMessage, SearchResultItem } from "../../lib/api/rust/research";
import { useTranslation } from "../../lib/i18n";
import { useResearchModelOptions } from "../../lib/hooks/useResearchModelOptions";
import { defaultResearchModel } from "../../lib/tools/researchModels";
import { MarkdownRenderer } from "../chat/markdown/MarkdownRenderer";
import { ResearchReferences } from "./ResearchReferences";
import { DelayedLoader } from "../util/DelayedLoader";
import { useModals } from "../../router";
import { useToolSessionSync } from "../../lib/hooks/useToolSessionSync";
import {
  archiveResearchSession,
  researchEntryFingerprint,
  researchSessionFingerprint,
  researchSessionHasContent,
} from "../../lib/tools/archiveToolSession";
import { historyDisplayName } from "../../lib/tools/historyStorage";
import {
  deleteResearchHistoryEntry,
  loadResearchHistory,
  renameResearchHistoryEntry,
  type ResearchHistoryEntry,
} from "../../lib/tools/researchHistory";
import { useToolSessionStore } from "../../lib/tools/toolSessionStore";
import { ToolHistoryDrawer } from "../tools/ToolHistoryDrawer";
import { ToolPageHeader } from "../tools/ToolPageHeader";

const SUGGESTIONS = [
  "research.suggestions.aiTrends",
  "research.suggestions.climate",
  "research.suggestions.productivity",
  "research.suggestions.cybersecurity",
] as const;

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

const selectSx = {
  minWidth: 0,
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #e5e5e5",
  bgcolor: "transparent",
  fontFamily: panelFont,
} as const;

const reportSx = {
  "& .markdown-body": {
    fontFamily: panelFont,
    fontSize: "0.9375rem",
    lineHeight: 1.75,
    color: "#1a1a1a",
  },
  "& .markdown-body h2": {
    fontSize: "1.05rem",
    fontWeight: 700,
    mt: 2.5,
    mb: 1,
    pb: 0.5,
    borderBottom: "1px solid #ececec",
    letterSpacing: "-0.01em",
  },
  "& .markdown-body h3": {
    fontSize: "0.975rem",
    fontWeight: 600,
    mt: 2,
    mb: 0.75,
  },
  "& .markdown-body p": {
    mb: 1.25,
  },
  "& .markdown-body ul, & .markdown-body ol": {
    mb: 1.25,
    pl: 2.5,
  },
  "& .markdown-body li": {
    mb: 0.5,
  },
  "& .markdown-body a[href*='#cite-']": {
    fontSize: "0.72em",
    fontWeight: 700,
    color: "var(--joy-palette-primary-600)",
    textDecoration: "none",
    verticalAlign: "super",
    lineHeight: 0,
    mx: 0.125,
    "&:hover": { textDecoration: "underline" },
  },
} as const;

interface ResearchTurn {
  id: string;
  query: string;
  content: string;
  citations: string[];
  searchResults: SearchResultItem[];
  citedIndices: number[];
}

function buildReferences(
  searchResults: SearchResultItem[],
  citations: string[],
  citedIndices: number[],
): { title: string; url: string }[] {
  const pool =
    searchResults.length > 0
      ? searchResults.map((s) => ({ title: s.title, url: s.url }))
      : citations.map((url) => ({ title: url, url }));

  if (!pool.length) return [];

  const indices =
    citedIndices.length > 0
      ? citedIndices
      : pool.map((_, i) => i + 1);

  return indices
    .map((index) => pool[index - 1])
    .filter((ref): ref is { title: string; url: string } => Boolean(ref));
}

export function ResearchAssistant() {
  const { t } = useTranslation();
  const modals = useModals();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: research, isPending } = useResearchQuery();
  const {
    options: researchModelOptions,
    grouped: groupedResearchModels,
    hasProvider,
  } = useResearchModelOptions();

  const storedResearch = useToolSessionStore.getState().research;
  const [modelId, setModelId] = useState(
    storedResearch?.modelId ?? defaultResearchModel(researchModelOptions) ?? "",
  );
  const [query, setQuery] = useState(storedResearch?.query ?? "");
  const [turns, setTurns] = useState<ResearchTurn[]>(
    storedResearch?.turns ?? [],
  );
  const [history, setHistory] = useState<ResearchHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    storedResearch?.activeTabId ?? null,
  );

  useEffect(() => {
    setHistory(loadResearchHistory());
  }, []);

  useEffect(() => {
    if (researchModelOptions.some((option) => option.id === modelId)) return;
    const fallback = defaultResearchModel(researchModelOptions);
    if (fallback) setModelId(fallback);
  }, [modelId, researchModelOptions]);

  const effectiveModel =
    researchModelOptions.find((option) => option.id === modelId)?.id ??
    defaultResearchModel(researchModelOptions) ??
    "";

  const selectedModelOption = researchModelOptions.find(
    (option) => option.id === effectiveModel,
  );

  const modelHint = useMemo(() => {
    if (selectedModelOption?.isDeepResearch) {
      return t("research.models.sonarDeepHint");
    }
    return t("research.models.sonarHint");
  }, [selectedModelOption, t]);

  const researchSession = useMemo(
    () => ({
      modelId: effectiveModel,
      query,
      turns,
      activeTabId,
    }),
    [effectiveModel, query, turns, activeTabId],
  );

  const sessionFingerprint = useMemo(
    () => researchSessionFingerprint(researchSession),
    [researchSession],
  );

  useToolSessionSync(
    "research",
    researchSession,
    researchSessionHasContent(researchSession),
    sessionFingerprint,
  );

  const buildMessages = useCallback(
    (nextQuery: string): ResearchMessage[] => {
      const history: ResearchMessage[] = [];
      for (const turn of turns) {
        history.push({ role: "user", content: turn.query });
        history.push({ role: "assistant", content: turn.content });
      }
      history.push({ role: "user", content: nextQuery });
      return history;
    },
    [turns],
  );

  const historyItems = useMemo(
    () =>
      history.map((entry) => ({
        id: entry.id,
        title: historyDisplayName(
          entry.name,
          entry.turns[0]?.query ?? "",
          t("toolHistory.untitled"),
        ),
        createdAt: entry.createdAt,
      })),
    [history, t],
  );

  const resetTab = () => {
    setTurns([]);
    setQuery("");
    setActiveTabId(null);
    useToolSessionStore.getState().resetResearch();
  };

  const handleNewTab = () => {
    const saved = Boolean(archiveResearchSession(researchSession));
    resetTab();
    if (saved) {
      setHistory(loadResearchHistory());
      toast.success(t("toolHistory.saved"));
    }
  };

  const handleHistorySelect = (id: string) => {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    setModelId(entry.model);
    setTurns(
      entry.turns.map((turn) => ({
        id: uuidv4(),
        query: turn.query,
        content: turn.content,
        citations: turn.citations,
        searchResults: turn.searchResults,
        citedIndices: turn.citedIndices,
      })),
    );
    setQuery("");
    setActiveTabId(entry.id);
    const store = useToolSessionStore.getState();
    store.setResearchBaseline(researchEntryFingerprint(entry));
    store.setResearchDirty(false);
    setHistoryOpen(false);
  };

  const handleHistoryRename = (id: string, name: string) => {
    setHistory(renameResearchHistoryEntry(id, name));
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(deleteResearchHistoryEntry(id));
    if (activeTabId === id) setActiveTabId(null);
    toast.success(t("toolHistory.deleted"));
  };

  const runQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !hasProvider) return;

    const turnId = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        query: trimmed,
        content: "",
        citations: [],
        searchResults: [],
        citedIndices: [],
      },
    ]);
    setQuery("");

    try {
      const result = await research({
        model: effectiveModel,
        messages: buildMessages(trimmed),
      });
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                content: result.content,
                citations: result.citations,
                searchResults: result.searchResults,
                citedIndices: result.citedIndices,
              }
            : turn,
        ),
      );
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    } catch (e) {
      console.error(e);
      setTurns((prev) => prev.filter((turn) => turn.id !== turnId));
      toast.error(
        e instanceof Error ? e.message : t("research.queryFailed"),
      );
    }
  };

  const handleSubmit = () => {
    void runQuery(query);
  };

  const handleNewResearch = () => {
    resetTab();
  };

  const showEmptyState = turns.length === 0 && !isPending;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        fontFamily: panelFont,
        overflow: "hidden",
      }}
    >
      <ToolPageHeader
        icon={<Language sx={{ fontSize: 22 }} />}
        title={t("research.title")}
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
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          maxWidth: 760,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
      <Typography level="body-sm" sx={{ color: "neutral.600", mb: 2 }}>
        {t("research.subtitle")}
      </Typography>

      {!hasProvider && (
        <Alert
          color="warning"
          variant="soft"
          sx={{ mb: 2 }}
          endDecorator={
            <Button
              size="sm"
              variant="soft"
              onClick={() => modals.open("/apiKeys")}
            >
              {t("research.openApiKeys")}
            </Button>
          }
        >
          {t("research.noApiKey")}
        </Alert>
      )}

      {researchModelOptions.length === 0 && hasProvider && (
        <Alert color="warning" variant="soft" sx={{ mb: 2 }}>
          {t("research.noModels")}
        </Alert>
      )}

      <Card
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: "12px",
          border: "1px solid #e5e5e5",
          boxShadow: "none",
        }}
      >
        <Typography level="body-xs" sx={{ mb: 1, color: "neutral.600" }}>
          {t("research.modelLabel")}
        </Typography>
        <Select
          value={effectiveModel}
          onChange={(_, value) => value && setModelId(value)}
          disabled={!researchModelOptions.length}
          sx={selectSx}
        >
          {groupedResearchModels.flatMap(({ group, models }) => [
            <Option
              key={`${group}-header`}
              value={`__group-${group}`}
              disabled
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "neutral.500",
                opacity: 1,
                cursor: "default",
                "&.Mui-disabled": { opacity: 1 },
              }}
            >
              {t(`research.modelGroups.${group}`)}
            </Option>,
            ...models.map((model) => (
              <Option key={model.id} value={model.id}>
                {model.label}
              </Option>
            )),
          ])}
        </Select>
        <Typography level="body-xs" sx={{ mt: 0.75, color: "neutral.500" }}>
          {modelHint}
        </Typography>

        <Textarea
          data-testid="research-query-input"
          placeholder={t("research.queryPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          minRows={3}
          maxRows={8}
          sx={{
            mt: 2,
            borderRadius: "10px",
            border: "1px solid #e5e5e5",
            fontFamily: panelFont,
            "--Textarea-focusedHighlight": "transparent",
            "--Textarea-focusedThickness": "0px",
            "& textarea": { fontSize: "0.95rem", lineHeight: 1.6 },
          }}
        />

        {showEmptyState && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
            {SUGGESTIONS.map((key) => (
              <Chip
                key={key}
                variant="soft"
                color="neutral"
                size="sm"
                onClick={() => {
                  const text = t(key);
                  setQuery(text);
                }}
                sx={{ cursor: "pointer" }}
              >
                {t(key)}
              </Chip>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
          {turns.length > 0 && (
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleNewResearch}
              disabled={isPending}
            >
              {t("research.newResearch")}
            </Button>
          )}
          <Button
            startDecorator={<Search />}
            loading={isPending}
            disabled={
              !query.trim() || !hasProvider || !researchModelOptions.length
            }
            onClick={handleSubmit}
          >
            {turns.length > 0 ? t("research.askFollowUp") : t("research.search")}
          </Button>
        </Box>
      </Card>

      <Box ref={resultsRef} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {turns.map((turn) => (
          <ResearchTurnCard key={turn.id} turn={turn} isLoading={!turn.content} />
        ))}
      </Box>
      </Box>
    </Box>
  );
}

function ResearchTurnCard({
  turn,
  isLoading,
}: {
  turn: ResearchTurn;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  const references = useMemo(
    () =>
      buildReferences(turn.searchResults, turn.citations, turn.citedIndices),
    [turn.citations, turn.citedIndices, turn.searchResults],
  );

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: "12px",
        border: "1px solid #e5e5e5",
        boxShadow: "none",
      }}
    >
      <Typography
        level="body-xs"
        sx={{
          color: "neutral.500",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          mb: 0.5,
        }}
      >
        {t("research.reportLabel")}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
        <Language sx={{ fontSize: 20, color: "neutral.500", mt: 0.25 }} />
        <Typography level="title-md" sx={{ fontWeight: 600, flex: 1 }}>
          {turn.query}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <DelayedLoader />
          <Typography level="body-sm" sx={{ color: "neutral.500" }}>
            {t("research.searching")}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={reportSx}>
            <MarkdownRenderer content={turn.content} />
          </Box>
          <ResearchReferences references={references} />
        </>
      )}
    </Card>
  );
}
