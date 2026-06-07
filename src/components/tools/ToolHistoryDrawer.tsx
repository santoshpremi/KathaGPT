import { Close, History } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Sheet,
  Typography,
} from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { LeafItemDropdown } from "../sidebar/tree/LeafItemDropdown";
import { ConfirmModal } from "../sidebar/tree/ConfirmModal";
import { RenameToolHistoryModal } from "./RenameToolHistoryModal";

export interface ToolHistoryListItem {
  id: string;
  title: string;
  createdAt: string;
}

interface ToolHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  entries: ToolHistoryListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

export function ToolHistoryDrawer({
  open,
  onClose,
  entries,
  selectedId,
  onSelect,
  onRename,
  onDelete,
}: ToolHistoryDrawerProps) {
  const { t } = useTranslation();
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const renameEntry = entries.find((e) => e.id === renameId);

  if (!open) return null;

  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.25)",
          zIndex: 1200,
        }}
      />
      <Sheet
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: { xs: "100%", sm: 320 },
          maxWidth: "100vw",
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e5e5e5",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
          fontFamily: panelFont,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1.25,
            borderBottom: "1px solid #ececf1",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <History sx={{ fontSize: 18, color: "neutral.600" }} />
            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
              {t("toolHistory.title")}
            </Typography>
          </Box>
          <IconButton size="sm" variant="plain" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", px: 0.5, py: 0.5 }}>
          {entries.length === 0 ? (
            <Typography
              level="body-sm"
              textColor="neutral.500"
              textAlign="center"
              sx={{ px: 2, py: 6 }}
            >
              {t("toolHistory.empty")}
            </Typography>
          ) : (
            <List size="sm" sx={{ "--ListItem-paddingY": "2px" }}>
              {entries.map((entry) => (
                <ListItem key={entry.id} sx={{ py: 0, px: 0.5 }}>
                  <ListItemButton
                    selected={selectedId === entry.id}
                    onClick={() => onSelect(entry.id)}
                    className="group"
                    sx={{
                      py: 0.5,
                      minHeight: 0,
                      borderRadius: "md",
                      fontSize: "14px",
                    }}
                  >
                    <ListItemContent
                      sx={{
                        fontSize: "14px",
                        lineHeight: 1.35,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.title}
                    </ListItemContent>
                    <Box
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ flexShrink: 0, height: 22 }}
                    >
                      <LeafItemDropdown
                        onEdit={() => setRenameId(entry.id)}
                        onDelete={() => setDeleteId(entry.id)}
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Sheet>

      <RenameToolHistoryModal
        open={renameId !== null}
        initialName={renameEntry?.title ?? ""}
        onClose={() => setRenameId(null)}
        onRename={(name) => {
          if (renameId) onRename(renameId, name);
        }}
      />

      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onSure={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
