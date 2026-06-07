import { InterpreterModeOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useTranslation } from "../../lib/i18n";
import { useToolSessionSync } from "../../lib/hooks/useToolSessionSync";
import {
  archiveMeetingSession,
  meetingEntryFingerprint,
  meetingSessionFingerprint,
  meetingSessionHasContent,
} from "../../lib/tools/archiveToolSession";
import { historyDisplayName } from "../../lib/tools/historyStorage";
import {
  deleteMeetingHistoryEntry,
  loadMeetingHistory,
  renameMeetingHistoryEntry,
  type MeetingAction,
  type MeetingHistoryEntry,
} from "../../lib/tools/meetingHistory";
import { useToolSessionStore } from "../../lib/tools/toolSessionStore";
import { ToolHistoryDrawer } from "../tools/ToolHistoryDrawer";
import { ToolPageHeader } from "../tools/ToolPageHeader";
import { useQueuedMessagesStore } from "../../lib/context/queuedMessagesStore";
import { useCreateChat, useUpdateChat } from "../../lib/api/rust";
import { useNavigate } from "../../router";
import { useCurrentOrganizationId } from "../../lib/api/useCurrentOrganizationId";
import type { ModelOverride } from "@backend/api/chat/chatTypes";

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

const ACTION_PROMPTS: Record<MeetingAction, string> = {
  summarize:
    "Summarize the following meeting notes and highlight key decisions:\n\n",
  "action-items":
    "Extract action items with owners and deadlines from these meeting notes:\n\n",
};

export function MeetingTools() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organizationId = useCurrentOrganizationId();
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const { mutateAsync: createChat } = useCreateChat();
  const { mutateAsync: setModelOverride } = useUpdateChat();

  const storedMeeting = useToolSessionStore.getState().meeting;
  const [notes, setNotes] = useState(storedMeeting?.notes ?? "");
  const [lastAction, setLastAction] = useState<MeetingAction>(
    storedMeeting?.lastAction ?? "summarize",
  );
  const [history, setHistory] = useState<MeetingHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    storedMeeting?.activeTabId ?? null,
  );
  const [processing, setProcessing] = useState(false);

  const meetingSession = useMemo(
    () => ({ notes, lastAction, activeTabId }),
    [notes, lastAction, activeTabId],
  );

  const sessionFingerprint = useMemo(
    () => meetingSessionFingerprint(meetingSession),
    [meetingSession],
  );

  useToolSessionSync(
    "meeting",
    meetingSession,
    meetingSessionHasContent(meetingSession),
    sessionFingerprint,
  );

  useEffect(() => {
    setHistory(loadMeetingHistory());
  }, []);

  const historyItems = useMemo(
    () =>
      history.map((entry) => ({
        id: entry.id,
        title: historyDisplayName(
          entry.name,
          entry.notes,
          t("toolHistory.untitled"),
        ),
        createdAt: entry.createdAt,
      })),
    [history, t],
  );

  const resetTab = () => {
    setNotes("");
    setLastAction("summarize");
    setActiveTabId(null);
    useToolSessionStore.getState().resetMeeting();
  };

  const handleNewTab = () => {
    const saved = Boolean(archiveMeetingSession(meetingSession));
    resetTab();
    if (saved) {
      setHistory(loadMeetingHistory());
      toast.success(t("toolHistory.saved"));
    }
  };

  const runMeetingAction = async (action: MeetingAction) => {
    if (!notes.trim()) {
      toast.error(t("tools.meetingTools.notesRequired"));
      return;
    }

    setLastAction(action);
    setProcessing(true);

    try {
      const chatId = uuidv4();
      const title = t("tools.meetingTools.title");
      await createChat({ id: chatId, name: title, organizationId });
      await setModelOverride({
        chatId,
        modelOverride: "gemini-1.5-pro" as ModelOverride,
      });
      clearQueue();
      enqueueMessage({
        chatId,
        content: ACTION_PROMPTS[action] + notes.trim(),
        modelOverride: "gemini-1.5-pro" as ModelOverride,
      });
      await navigate("/:organizationId/chats/:chatId", {
        params: { organizationId, chatId },
      });
    } catch (e) {
      console.error(e);
      toast.error(t("chatUpdateFailed"));
    } finally {
      setProcessing(false);
    }
  };

  const handleHistorySelect = (id: string) => {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    setNotes(entry.notes);
    setLastAction(entry.action);
    setActiveTabId(entry.id);
    const store = useToolSessionStore.getState();
    store.setMeetingBaseline(meetingEntryFingerprint(entry));
    store.setMeetingDirty(false);
    setHistoryOpen(false);
  };

  const handleHistoryRename = (id: string, name: string) => {
    setHistory(renameMeetingHistoryEntry(id, name));
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(deleteMeetingHistoryEntry(id));
    if (activeTabId === id) setActiveTabId(null);
    toast.success(t("toolHistory.deleted"));
  };

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
        icon={<InterpreterModeOutlined sx={{ fontSize: 22 }} />}
        title={t("tools.meetingTools.title")}
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
          {t("tools.meetingTools.subtitle")}
        </Typography>

        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "12px",
            border: "1px solid #e5e5e5",
            boxShadow: "none",
          }}
        >
          <Typography level="body-xs" sx={{ mb: 1, color: "neutral.600" }}>
            {t("tools.meetingTools.notesLabel")}
          </Typography>
          <Textarea
            placeholder={t("tools.meetingTools.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={12}
            sx={{
              borderRadius: "10px",
              border: "1px solid #e5e5e5",
              fontFamily: panelFont,
              "--Textarea-focusedHighlight": "transparent",
              "--Textarea-focusedThickness": "0px",
              "& textarea": { fontSize: "0.95rem", lineHeight: 1.6 },
            }}
          />

          <Box sx={{ display: "flex", gap: 1, mt: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="neutral"
              loading={processing}
              disabled={!notes.trim()}
              onClick={() => void runMeetingAction("summarize")}
            >
              {t("tools.meetingTools.summarize")}
            </Button>
            <Button
              loading={processing}
              disabled={!notes.trim()}
              onClick={() => void runMeetingAction("action-items")}
            >
              {t("tools.meetingTools.actionItems")}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
