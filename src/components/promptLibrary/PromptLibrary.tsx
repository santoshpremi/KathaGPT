import { Add, LibraryBooksOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useTranslation } from "../../lib/i18n";
import { extractVariables } from "../../lib/prompts/promptVariables";
import {
  deletePrompt,
  loadSavedPrompts,
  savePrompt,
  updatePrompt,
  type SavedPrompt,
} from "../../lib/prompts/promptLibraryStorage";
import { useCreateChat } from "../../lib/api/rust";
import { useQueuedMessagesStore } from "../../lib/context/queuedMessagesStore";
import { useNavigate } from "../../router";
import { useCurrentOrganizationId } from "../../lib/api/useCurrentOrganizationId";
import { LeafItemDropdown } from "../sidebar/tree/LeafItemDropdown";
import { ConfirmModal } from "../sidebar/tree/ConfirmModal";
import { PromptEditor } from "./PromptEditor";
import { PromptGuideModal } from "./PromptGuideModal";
import { PromptLibraryCard } from "./PromptLibraryCard";

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

export function PromptLibrary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organizationId = useCurrentOrganizationId();
  const clearQueue = useQueuedMessagesStore((s) => s.clear);
  const enqueueMessage = useQueuedMessagesStore((s) => s.addQueuedMessage);
  const { mutateAsync: createChat } = useCreateChat();

  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    setPrompts(loadSavedPrompts());
  }, []);

  const editingPrompt = prompts.find((prompt) => prompt.id === editingId) ?? null;
  const showEditor = isCreating || Boolean(editingId);

  const refresh = () => setPrompts(loadSavedPrompts());

  const handleSave = (draft: { title: string; content: string }) => {
    const variables = extractVariables(draft.content);
    if (editingId) {
      updatePrompt(editingId, {
        name: draft.title,
        content: draft.content,
        variables,
      });
      toast.success(t("promptLibrary.saved"));
    } else {
      savePrompt({
        id: uuidv4(),
        name: draft.title,
        content: draft.content,
        variables,
        createdAt: new Date().toISOString(),
      });
      toast.success(t("promptLibrary.created"));
    }
    setEditingId(null);
    setIsCreating(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deletePrompt(id);
    if (editingId === id) {
      setEditingId(null);
      setIsCreating(false);
    }
    refresh();
    toast.success(t("promptLibrary.deleted"));
  };

  const startChatWithPrompt = async (prompt: SavedPrompt) => {
    try {
      const chatId = uuidv4();
      await createChat({
        id: chatId,
        name: prompt.name,
        organizationId,
      });
      clearQueue();
      enqueueMessage({ chatId, content: prompt.content });
      await navigate("/:organizationId/chats/:chatId", {
        params: { organizationId, chatId },
      });
    } catch (error) {
      console.error(error);
      toast.error(t("chatUpdateFailed"));
    }
  };

  const openNewPrompt = () => {
    setEditingId(null);
    setIsCreating(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        fontFamily: panelFont,
        bgcolor: "#fbfbfc",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          width: "100%",
          px: { xs: 2, sm: 4 },
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LibraryBooksOutlined sx={{ fontSize: 28, color: "#0d0d0d" }} />
            <Box>
              <Typography level="h3" sx={{ fontWeight: 700 }}>
                {t("promptLibrary.title")}
              </Typography>
              <Typography level="body-sm" sx={{ color: "neutral.600", mt: 0.25 }}>
                {t("promptLibrary.subtitle")}
              </Typography>
            </Box>
          </Box>
          <Button
            startDecorator={<Add />}
            onClick={openNewPrompt}
            sx={{
              flexShrink: 0,
              bgcolor: "#0d0d0d",
              "&:hover": { bgcolor: "#353740" },
            }}
          >
            {t("promptLibrary.newPrompt")}
          </Button>
        </Box>

        <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3 }}>
          {showEditor && (
            <PromptEditor
              initial={editingPrompt}
              onSave={handleSave}
              onCancel={() => {
                setEditingId(null);
                setIsCreating(false);
              }}
            />
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <PromptLibraryCard
              title={t("promptLibrary.practices.cardTitle")}
              description={t("promptLibrary.practices.cardDescription")}
              category="guides"
              badgeLabel="TIPS"
              gradientIndex={0}
              onClick={() => setGuideOpen(true)}
            />

            {prompts.map((prompt, index) => (
              <PromptLibraryCard
                key={prompt.id}
                title={prompt.name ?? t("promptLibrary.untitled")}
                description={prompt.content}
                category="saved"
                createdAt={prompt.createdAt}
                gradientIndex={index + 1}
                onClick={() => void startChatWithPrompt(prompt)}
                endDecorator={
                  <LeafItemDropdown
                    onEdit={() => {
                      setIsCreating(false);
                      setEditingId(prompt.id);
                    }}
                    onDelete={() => setDeleteId(prompt.id)}
                  />
                }
              />
            ))}
          </Box>
        </Box>
      </Box>

      <PromptGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

      <ConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onSure={() => {
          if (deleteId) handleDelete(deleteId);
          setDeleteId(null);
        }}
        customTitle={t("promptLibrary.deleteTitle")}
        customMessage={t("promptLibrary.deleteMessage")}
      />
    </Box>
  );
}
