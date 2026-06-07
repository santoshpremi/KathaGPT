import { Modal as JoyModal } from "@mui/joy";
import { useModals } from "../../router";

export default function RouteModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const modals = useModals();
  const onClose = () => {
    modals.close();
  };

  return (
    <JoyModal open={true} onClose={onClose}>
      {children as React.ReactElement}
    </JoyModal>
  );
}
