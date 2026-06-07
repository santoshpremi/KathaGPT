import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useTranslation } from "../../../lib/i18n";

export function ConfirmModal({
  open,
  onClose,
  onSure,
  customTitle,
  customMessage,
  customConfirmText,
}: {
  open: boolean;
  customMessage?: React.ReactNode;
  customTitle?: React.ReactNode;
  customConfirmText?: string;
  onClose: () => void;
  onSure: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="title-lg">
          {customTitle ?? t("areYouSure")}
        </Typography>
        <Typography level="body-sm" className="max-w-md">
          {customMessage}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            color="danger"
            onClick={() => {
              onSure();
              onClose();
            }}
          >
            {customConfirmText ?? t("deletePermanently")}
          </Button>
          <Button color="neutral" onClick={onClose}>
            {t("cancel")}
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
