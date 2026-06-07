import { Button, Textarea } from "@mui/joy";
import { useTranslation } from "react-i18next";

export function MessageEditor({
  editedContent,
  setEditedContent,
  setEditing,
  onEditSafe,
}: {
  editedContent: string;
  setEditedContent: (content: string) => void;
  setEditing: (editing: boolean) => void;
  onEditSafe: (content: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 flex items-center gap-3">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
          // used for breaking lines
          else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEditSafe(editedContent.trim());
          }
        }}
        autoFocus
        className="w-full"
      />
      <Button
        variant="outlined"
        color="neutral"
        sx={{ m: 0 }}
        onClick={() => {
          setEditing(false);
        }}
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
