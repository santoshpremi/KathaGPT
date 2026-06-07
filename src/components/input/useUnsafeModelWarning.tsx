import {
  Button,
  Checkbox,
  FormControl,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOneTimeInfoModal } from "../../lib/context/infoModalStore";

export function useUnsafeModelWarning<Model>({
  setModel,
  isEuHosted,
  nonEuWarningSkippable,
  onModalClose,
  modalContentTranslationKey = "nonEuModelWarning", // t('nonEuModelWarning')
}: {
  setModel: (model: Model) => void;
  isEuHosted: (model: Model) => boolean;
  nonEuWarningSkippable: boolean;
  onModalClose?: () => void;
  modalContentTranslationKey?: string;
}) {
  const { t } = useTranslation();
  const warningModal = useOneTimeInfoModal("unsafe-model-warning");
  const hasClosedForever = warningModal.closed;
  const [modalOpen, setModalOpen] = useState(false);
  const [isHideForeverChecked, setIsHideForeverChecked] = useState(false);
  const modelRef = useRef<Model | null>(null);

  const doesRenderModal = !nonEuWarningSkippable || !hasClosedForever;

  const safeSetModel = (model: Model) => {
    if (!isEuHosted(model) && doesRenderModal) {
      setModalOpen(true);
      modelRef.current = model;
    } else {
      setModel(model);
      setModalOpen(false);
      onModalClose?.();
    }
  };

  const renderModal = () =>
    doesRenderModal && (
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog>
          <div className="flex flex-col gap-2">
            <Typography level="h4">{t("warning")}</Typography>
            <Typography className="max-w-md" whiteSpace="pre-line">
              {t(modalContentTranslationKey)}
            </Typography>
            {nonEuWarningSkippable && (
              <FormControl>
                <Checkbox
                  label={t("unsafeModel.continueForever")}
                  checked={isHideForeverChecked}
                  onChange={(e) => setIsHideForeverChecked(e.target.checked)}
                />
              </FormControl>
            )}
            <div className="flex flex-row items-center justify-end gap-4 pt-4">
              <Button
                color="warning"
                variant="soft"
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                {t("unsafeModel.cancel")}
              </Button>
              <Button
                variant="solid"
                onClick={() => {
                  setModel(modelRef.current!);
                  setModalOpen(false);
                  onModalClose?.();
                  if (isHideForeverChecked) {
                    warningModal.onModalClose();
                  }
                }}
              >
                {t("unsafeModel.continue")}
              </Button>
            </div>
          </div>
        </ModalDialog>
      </Modal>
    );

  return {
    safeSetModel,
    renderModal,
  };
}
