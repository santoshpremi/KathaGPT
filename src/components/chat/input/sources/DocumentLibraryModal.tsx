import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useDeleteDocument,
  useKnowledgeCollections,
  useReindexDocument,
  useRagStatus,
} from "../../../../lib/api/localHooks";

export function DocumentLibraryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: collections, isLoading } = useKnowledgeCollections();
  const { data: status } = useRagStatus();
  const deleteDocument = useDeleteDocument();
  const reindexDocument = useReindexDocument();
  const [busyId, setBusyId] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["rag"] });
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteDocument(id);
      invalidate();
    } finally {
      setBusyId(null);
    }
  };

  const handleReindex = async (id: string) => {
    setBusyId(id);
    try {
      await reindexDocument(id);
      invalidate();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 420, maxWidth: 560 }}>
        <ModalClose />
        <Typography level="h4">{t("documents.library.title")}</Typography>
        {status && (
          <Typography level="body-sm" textColor="neutral.500">
            {t("documents.library.status", {
              embedder: status.embedder,
              chunks: status.totalChunks,
              docs: status.indexedDocuments,
            })}
          </Typography>
        )}
        {status?.needsReindex && (
          <Typography level="body-sm" textColor="warning.600">
            {t("contextTokens.embedderUpgraded")}
          </Typography>
        )}
        {isLoading && (
          <Typography level="body-sm">{t("loading")}</Typography>
        )}
        {!isLoading && (!collections || collections.length === 0) && (
          <Typography level="body-sm" textColor="neutral.500">
            {t("documents.library.empty")}
          </Typography>
        )}
        <List sx={{ maxHeight: 360, overflow: "auto" }}>
          {(collections ?? []).map((doc) => (
            <ListItem key={doc.id}>
              <ListItemContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                >
                  <div className="min-w-0 flex-1">
                    <Typography level="title-sm" noWrap>
                      {doc.name}
                    </Typography>
                    {doc.description && (
                      <Typography level="body-xs" textColor="neutral.500">
                        {doc.description}
                      </Typography>
                    )}
                  </div>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      disabled={busyId === doc.id}
                      onClick={() => void handleReindex(doc.id)}
                      aria-label={t("documents.library.reindex")}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="danger"
                      disabled={busyId === doc.id}
                      onClick={() => void handleDelete(doc.id)}
                      aria-label={t("documents.library.delete")}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </ModalDialog>
    </Modal>
  );
}

export function DocumentLibraryButton({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="plain"
        color="neutral"
        disabled={disabled}
        startDecorator={<FolderOpenIcon fontSize="small" />}
        onClick={() => setOpen(true)}
      >
        {t("documents.library.open")}
      </Button>
      <DocumentLibraryModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
