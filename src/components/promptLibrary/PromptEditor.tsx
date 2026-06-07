import { SaveOutlined } from "@mui/icons-material";
import { Box, Button, Input, Textarea } from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "../../lib/i18n";
import type { SavedPrompt } from "../../lib/prompts/promptLibraryStorage";

const panelFont = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

interface PromptEditorProps {
  initial?: SavedPrompt | null;
  onSave: (draft: { title: string; content: string }) => void;
  onCancel: () => void;
}

export function PromptEditor({ initial, onSave, onCancel }: PromptEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.name ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const canSave = Boolean(title.trim() && content.trim());

  return (
    <Box
      sx={{
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        p: 2.5,
        bgcolor: "#ffffff",
        fontFamily: panelFont,
        mb: 3,
      }}
    >
      <Input
        placeholder={t("promptLibrary.editor.titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          mb: 1.5,
          borderRadius: "8px",
          border: "1px solid #e5e5e5",
          fontFamily: panelFont,
        }}
      />

      <Textarea
        placeholder={t("promptLibrary.editor.contentPlaceholder")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minRows={6}
        sx={{
          borderRadius: "8px",
          border: "1px solid #e5e5e5",
          fontFamily: panelFont,
          "--Textarea-focusedHighlight": "#0891b2",
          "--Textarea-focusedThickness": "1px",
          "& textarea": { fontSize: "0.95rem", lineHeight: 1.6 },
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          pt: 2,
          borderTop: "1px solid #ececf1",
        }}
      >
        <Button variant="plain" color="neutral" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          startDecorator={<SaveOutlined />}
          disabled={!canSave}
          onClick={() => onSave({ title: title.trim(), content: content.trim() })}
          sx={{
            bgcolor: canSave ? "#0d0d0d" : undefined,
            "&:hover": { bgcolor: canSave ? "#353740" : undefined },
          }}
        >
          {t("promptLibrary.editor.save")}
        </Button>
      </Box>
    </Box>
  );
}
