import {
  Add,
  AutoAwesome,
  Close,
  Done,
  PlagiarismOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Card,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/joy";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type RagMode } from "@backend/api/chat/chatTypes";
import { useDocumentHeader } from "../../../../lib/api/documents";
import { usePrimaryColor } from "../../../../lib/hooks/useTheme";
import {
  type AttachedDocument,
  type SelectableKnowledgeCollections,
} from "../ChatInput";

export interface RagModeInput {
  mode: RagMode;
  customSourceId?: string;
}

interface ChatSourceContainerProps {
  isVisible: boolean;
  ragEnabled: boolean;
  documents: AttachedDocument[];
  fileUploadEnabled: boolean;
  sources: SelectableKnowledgeCollections;
  ragMode: RagModeInput;
  removeDocument: (id: string) => void;
  uploadDocument: () => void;
  handleRagMode: ({ mode, customSourceId }: RagModeInput) => void;
}

export default function ChatSourceContainer({
  isVisible,
  sources,
  documents,
  ragEnabled,
  removeDocument,
  fileUploadEnabled,
  uploadDocument,
  handleRagMode,
  ragMode,
}: ChatSourceContainerProps) {
  const { t } = useTranslation();

  const emptySources = sources?.length === 0;

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        visible: {
          height: "auto",
          borderWidth: 1,
          opacity: 1,
        },
        hidden: { height: 0, borderWidth: 0, opacity: 0 },
      }}
      className="border-neutral-180 absolute bottom-[calc(100%-1.5rem)] left-0 right-0 overflow-y-hidden rounded-t-lg border bg-neutral-100"
    >
      <div className="mb-6 flex w-full items-center gap-3 overflow-x-auto p-3">
        {fileUploadEnabled && (
          <SourceCard
            center
            onClick={uploadDocument}
            className="min-w-[150px]"
            icon={<Add sx={{ height: 18, width: 18 }} />}
            text={t("common.upload.files")}
          />
        )}
        {documents.map(({ id }) => (
          <DocumentCard
            key={id}
            documentId={id}
            onClick={() => removeDocument(id)}
          />
        ))}
        {ragEnabled && fileUploadEnabled && <Divider orientation="vertical" />}
        {ragEnabled &&
          (sources || []).map(({ id, name, isNew }) => {
            const enabled = ragMode.customSourceId === id;
            return (
              <SourceCard
                className="w-[180px] flex-shrink-0"
                key={id}
                newSource={isNew}
                onClick={() =>
                  handleRagMode({ mode: "CUSTOM", customSourceId: id })
                }
                active={enabled}
                icon={<PlagiarismOutlined sx={{ height: 18, width: 18 }} />}
                text={name}
                hoverText={t("knowledgeBase.unselectDataSource")}
              />
            );
          })}
        {ragEnabled && !emptySources && (
          <SourceCard
            center
            onClick={() => handleRagMode({ mode: "AUTO" })}
            className="w-[180px] flex-shrink-0"
            active={ragMode.mode === "AUTO"}
            icon={<AutoAwesome fontSize="small" />}
            text={t("knowledgeBase.automaticallyDetectSource")}
            hoverText={t("knowledgeBase.unselectAutomaticSource")}
          />
        )}
        {ragEnabled && emptySources && (
          <NoSourcesCard className="w-full max-w-[180px] flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}

interface DocumentCardProps {
  documentId: string;
  onClick: () => void;
}

function DocumentCard({ documentId, onClick }: DocumentCardProps) {
  const { t } = useTranslation();
  const header = useDocumentHeader(documentId);

  function insertZeroWidthSpaces(fileName: string): string {
    return fileName.replace(/([_-])/g, "$1\u200B");
  }

  if (!header)
    return (
      <Card
        sx={{
          height: 120,
          width: 200,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Card>
    );

  const title = insertZeroWidthSpaces(header.fileName);

  return (
    <SourceCard
      active
      className="w-[200px] shrink-0 hover:bg-neutral-50"
      onClick={onClick}
      text={title}
      hoverText={t("knowledgeBase.removeDocument")}
    />
  );
}

interface SourceCardProps {
  onClick: VoidFunction;
  icon?: React.ReactNode;
  text?: string;
  source?: string;
  active?: boolean;
  className?: string;
  center?: boolean;
  newSource?: boolean;
  hoverText?: string;
}

function SourceCard({
  onClick,
  icon,
  text,
  className,
  source,
  active,
  center,
  newSource,
  hoverText,
}: SourceCardProps) {
  const [hover, setHover] = useState<boolean>(false);
  const primaryColor = usePrimaryColor();
  const { t } = useTranslation();

  const highlight = (active && !hover) || (!active && hover);
  return (
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className={className}
      sx={{
        height: 120,
        justifyContent: "space-between",
        borderColor: highlight ? primaryColor : undefined,
        borderWidth: active && !hover ? 1.5 : 1,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      {newSource && (
        <div
          style={{ backgroundColor: primaryColor }}
          role="status"
          className="absolute right-4 top-4 rounded-full px-3 py-1"
        >
          <Typography
            level="body-xs"
            textColor="common.white"
            sx={{
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("knowledgeBase.newSource")}
          </Typography>
        </div>
      )}

      <Stack
        justifyContent={center ? "center" : "space-between"}
        alignItems={center ? "center" : "flex-start"}
        flex={1}
        spacing={1}
      >
        <Avatar
          size="sm"
          sx={{ bgcolor: active && !hover ? primaryColor : undefined }}
        >
          {active && !hover && (
            <Done sx={{ color: "white", height: 18, width: 18 }} />
          )}
          {active && hover && <Close sx={{ height: 18, width: 18 }} />}
          {!active && icon}
        </Avatar>
        <Stack width="100%">
          <Typography
            textColor={active && !hover ? primaryColor : undefined}
            level="body-sm"
            className="!line-clamp-2"
            sx={{
              whiteSpace: "normal",
              textAlign: center ? "center" : "left",
            }}
          >
            {active && hover ? hoverText : text ?? t("knowledgeBase.include")}
          </Typography>

          {source && (
            <Typography
              textColor={active && !hover ? primaryColor : undefined}
              level="body-md"
              sx={{
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {source}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

interface NoSourcesCardProps {
  className: string;
}

function NoSourcesCard({ className }: NoSourcesCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={className}
      sx={{
        height: 120,
        justifyContent: "space-between",
      }}
    >
      <Stack justifyContent="center" alignItems="center" flex={1} spacing={1}>
        <Typography
          textColor="black"
          level="body-sm"
          sx={{
            textAlign: "center",
          }}
        >
          {t("knowledgeBase.dataSources.noSources")}
        </Typography>
        <Typography
          textColor="neutral.500"
          level="body-sm"
          sx={{
            textAlign: "center",
          }}
        >
          {t("knowledgeBase.contactAdmin")}
        </Typography>
      </Stack>
    </Card>
  );
}
