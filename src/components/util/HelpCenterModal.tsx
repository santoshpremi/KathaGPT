import {
  Card,
  Link,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import NotesIcon from "@mui/icons-material/NotesOutlined";
import DomainIcon from "@mui/icons-material/DomainOutlined";
import {
  Article,
  AutoAwesome,
  Feedback,
  PlayCircle,
} from "@mui/icons-material";
import { useContactInfo } from "../../lib/api/localHooks";
import { useModals } from "../../router";
import { IntercomAppWrapper, IntercomButton } from "./IntercomButton";

import { KATHGPT_GITHUB_REPO, SUPPORT_EMAIL } from "../../shared/constants/contact";

const KATHGPT_README = `https://github.com/${KATHGPT_GITHUB_REPO}/blob/main/README.md`;
const KATHGPT_FEATURES = `https://github.com/${KATHGPT_GITHUB_REPO}/blob/main/docs/LOCAL_EDITION_FEATURES.md`;
const KATHGPT_MIGRATION = `https://github.com/${KATHGPT_GITHUB_REPO}/blob/main/docs/LOCAL_EDITION_MIGRATION_PLAN.md`;

const INTERCOM_ENABLED = false;

export function HelpCenterModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const modals = useModals();

  const organizationContactInfo = useContactInfo().data;
  const contactInfo = [organizationContactInfo];

  interface Contact {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    additionalInfo?: string | null;
    departmentName?: string | null;
  }

  const isContactEmpty = (obj: Contact | null | undefined): boolean =>
    !obj || !Object.keys(obj).some((k) => k !== "departmentName" && obj[k as keyof Contact]);
  const filteredContacts = contactInfo.filter(
    (contact) => !isContactEmpty(contact),
  );
  return (
/*     <IntercomAppWrapper>
 */      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <ModalDialog
          sx={{
            p: 3,
            overflowY: "auto",
            width: "80vw",
            maxWidth: "900px",
            maxHeight: "90vh",
          }}
        >
          <ModalClose />
          <Typography level="h2">{t("helpCenter.title")}</Typography>
          <Typography level="title-lg" mt={2}>
            {t("helpCenter.usefulLinks")}
          </Typography>
          <Stack direction="row" gap={2} alignItems="center">
            <HelpCenterResourceLink
              href={KATHGPT_README}
              icon={<Article />}
              text={t("documentation")}
            />
            <HelpCenterResourceLink
              href={KATHGPT_FEATURES}
              icon={<PlayCircle />}
              text={t("workflows")}
            />
            <HelpCenterResourceLink
              href={KATHGPT_MIGRATION}
              text={t("aiTools")}
              icon={<AutoAwesome />}
            />
          </Stack>
          {filteredContacts.length > 0 && (
            <div>
              <Typography level="title-lg" mt={4} mb={2}>
                {t("helpCenter.organizationContacts")}
              </Typography>
              <div
                className="grid gap-5 overflow-x-auto pb-5 pr-10"
                style={{ gridAutoColumns: "minmax(320px, auto)" }}
              >
                {filteredContacts.map((department, index) =>
                  department ? (
                    <ContactInfoItem key={index} {...department} />
                  ) : null,
                )}
              </div>
            </div>
          )}
          <Typography level="title-lg" mt={2}>
            {t("additionalResources")}
          </Typography>
          <Stack direction="row" gap={3} flexWrap="wrap">
            <HelpCenterResourceLink
              href={"mailto:" + SUPPORT_EMAIL}
              icon={<EmailIcon />}
              text={t("contactSupport")}
            />
            <HelpCenterResourceLink
              onClick={() => {
                setOpen(false);
                modals.open("/feedback");
              }}
              icon={<Feedback />}
              text={t("feedbackAndIdeas")}
            />
{/*             {INTERCOM_ENABLED && <IntercomButton />}
 */}          </Stack>
        </ModalDialog>
      </Modal>
/*     </IntercomAppWrapper>
 */  );
}

export type ContactInfo =
  | {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      additionalInfo?: string | null;
      departmentName?: string | null;
    }
  | null
  | undefined;

function ContactInfoItem({
  name,
  email,
  phone,
  additionalInfo,
  departmentName,
}: Exclude<ContactInfo, null | undefined>) {
  return (
    <Card className="row-start-1">
      <Stack gap={1} mb={2}>
        <Typography level="body-md" fontWeight="bold">
          {name}
        </Typography>
        {departmentName && (
          <Stack direction="row" gap={1}>
            <DomainIcon />
            <Typography level="body-md" color="neutral">
              {departmentName}
            </Typography>
          </Stack>
        )}
        {email && (
          <Stack direction="row" gap={1}>
            <EmailIcon />
            <Link
              display="block"
              href={"mailto:" + email}
              level="body-md"
              sx={{ wordBreak: "break-all" }}
            >
              {email}
            </Link>
          </Stack>
        )}
        {phone && (
          <Stack direction="row" gap={1}>
            <PhoneIcon />
            <Link
              display="block"
              href={"tel:" + phone}
              level="body-md"
              sx={{ wordBreak: "break-all" }}
            >
              {phone}
            </Link>
          </Stack>
        )}
        {additionalInfo && (
          <Stack direction="row" gap={1}>
            <NotesIcon style={{ color: "var(--joy-palette-neutral-400)" }} />
            <Typography
              level="body-md"
              sx={{
                width: "100%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                maxHeight: "80px",
                overflowY: "auto",
              }}
            >
              {additionalInfo}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export function HelpCenterResourceLink({
  href,
  icon,
  text,
  onClick,
}: {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Card className="flex-1">
      <Link
        href={href}
        onClick={onClick}
        underline="hover"
        target="_blank"
        className="flex items-center justify-center gap-2"
      >
        {icon}
        {text}
      </Link>
    </Card>
  );
}
