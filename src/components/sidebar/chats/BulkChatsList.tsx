import { ChatBubbleOutline, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Typography,
} from "@mui/joy";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { ChatListItem } from "@backend/api/chat/chatTypes";
import { useDeleteChats } from "../../../lib/api/rust";
import { useTranslation } from "../../../lib/i18n";
import { useNewChat } from "../../../lib/hooks/useNewChat";
import { useLocation } from "react-router";
import { useNavigate } from "../../../router";
import { ConfirmModal } from "../tree/ConfirmModal";

function formatChatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function BulkChatsList({
  chats,
  organizationId,
}: {
  chats: ChatListItem[];
  organizationId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const activeChatId = pathname.match(/\/chats\/([^/]+)/)?.[1];
  const { mutateAsync: deleteChats, isPending: deleting } = useDeleteChats();
  const { startNewChat } = useNewChat();

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedCount = selected.size;
  const allSelected = chats.length > 0 && selectedCount === chats.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const selectedIds = useMemo(() => [...selected], [selected]);

  const toggleOne = (chatId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(chats.map((c) => c.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    const ids = selectedIds;
    if (ids.length === 0) return;

    try {
      await deleteChats({ chatIds: ids });
      if (activeChatId && ids.includes(activeChatId)) {
        await startNewChat();
      }
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelected(new Set());
      toast.success(
        ids.length === 1
          ? t("chatDeleted")
          : t("chatsDeleted", { count: ids.length }),
      );
    } catch (e) {
      console.error(e);
      toast.error(t("chatDeleteFailed"));
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          flexWrap: "wrap",
          px: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            size="sm"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            aria-label={t("bulkChats.selectAll")}
          />
          <Typography level="body-sm" textColor="neutral.600">
            {selectedCount > 0
              ? t("bulkChats.selectedCount", { count: selectedCount })
              : t("bulkChats.selectAll")}
          </Typography>
        </Box>

        {selectedCount > 0 && (
          <>
            <Button
              size="sm"
              color="danger"
              variant="soft"
              startDecorator={<Delete />}
              loading={deleting}
              onClick={() => setConfirmOpen(true)}
            >
              {t("bulkChats.deleteSelected", { count: selectedCount })}
            </Button>
            <Button size="sm" variant="plain" onClick={clearSelection}>
              {t("bulkChats.clearSelection")}
            </Button>
          </>
        )}
      </Box>

      <List className="gap-1">
        {chats.map((chat) => {
          const isChecked = selected.has(chat.id);
          const isActive = activeChatId === chat.id;
          const label = chat.name?.trim() || t("untitledChat");

          return (
            <ListItem key={chat.id} sx={{ py: 0, px: 0 }}>
              <ListItemButton
                selected={isActive}
                onClick={() =>
                  navigate("/:organizationId/chats/:chatId", {
                    params: { organizationId, chatId: chat.id },
                  })
                }
                sx={{
                  borderRadius: "md",
                  gap: 1,
                  py: 1,
                }}
              >
                <Checkbox
                  size="sm"
                  checked={isChecked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleOne(chat.id)}
                  aria-label={t("bulkChats.selectChat", { name: label })}
                />
                <ChatBubbleOutline
                  sx={{ fontSize: "1rem", flexShrink: 0 }}
                  color={isActive ? "primary" : "inherit"}
                />
                <ListItemContent sx={{ minWidth: 0 }}>
                  <Typography
                    level="body-sm"
                    sx={{
                      fontWeight: isActive ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </Typography>
                </ListItemContent>
                <Typography
                  level="body-xs"
                  textColor="neutral.500"
                  sx={{ flexShrink: 0 }}
                >
                  {formatChatDate(chat.updatedAt)}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        customTitle={t("bulkChats.confirmTitle")}
        customMessage={t("bulkChats.confirmMessage", {
          count: selectedCount,
        })}
        customConfirmText={t("bulkChats.confirmDelete", {
          count: selectedCount,
        })}
        onSure={() => {
          void handleBulkDelete();
        }}
      />
    </>
  );
}
