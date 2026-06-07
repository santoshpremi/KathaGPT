import { Button } from "@mui/joy";
import { useTranslation } from "react-i18next";

export function ContentFilterActions({
  guidelines,
  setEditing,
  setGuidelinesModalOpen,
}: {
  guidelines: string | null | undefined;
  setEditing: (isEditing: boolean) => void;
  setGuidelinesModalOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Button
        onClick={() => setEditing(true)}
        variant="outlined"
        color="neutral"
      >
        {t("editMessage")}
      </Button>
      {guidelines && (
        <Button
          onClick={() => {
            setGuidelinesModalOpen(true);
          }}
          variant="outlined"
          color="neutral"
        >
          {t("openGuidelines")}
        </Button>
      )}
    </>
  );
}
