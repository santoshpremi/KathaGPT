import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useTranslation } from "../../lib/i18n";

interface RenameToolHistoryModalProps {
  open: boolean;
  initialName: string;
  onClose: () => void;
  onRename: (name: string) => void;
}

export function RenameToolHistoryModal({
  open,
  initialName,
  onClose,
  onRename,
}: RenameToolHistoryModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename(trimmed);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="title-lg">{t("toolHistory.rename")}</Typography>
        <FormControl required sx={{ mt: 2 }}>
          <FormLabel>{t("name")}</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoFocus
          />
        </FormControl>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="plain" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="solid" disabled={!name.trim()} onClick={handleSubmit}>
            {t("rename")}
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
}
