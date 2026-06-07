import { ModalClose, ModalDialog, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";
import RouteModal from "../../components/util/RouteModal";
import { TallyForm } from "../../components/analytics/TallyForm";
import { useOrganization } from "../../lib/api/organization";
import { useUser } from "../../lib/api/user";
import { DelayedLoader } from "../../components/util/DelayedLoader";

export default function Route() {
  return <FeedbackModal />;
}

function FeedbackModal() {
  const { t } = useTranslation();

  const organization = useOrganization();
  const me = useUser("me");

  return (
    <RouteModal>
      <ModalDialog sx={{ maxWidth: 500, width: "100%" }}>
        <ModalClose />
        <Typography id="api-key-modal-title" level="title-lg">
          {t("feedback")}
        </Typography>
        {me && organization ? (
          <TallyForm
            formId="mKvyeV"
            user_email={me?.primaryEmail ?? ""}
            user_name={`${me?.firstName ?? ""} ${me?.lastName ?? ""}`}
            org_name={organization.name}
          />
        ) : (
          <DelayedLoader />
        )}
      </ModalDialog>
    </RouteModal>
  );
}
