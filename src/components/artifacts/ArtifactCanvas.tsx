import {
  Button,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuItem,
  MenuButton,
  Typography,
  LinearProgress,
  Tooltip,
} from "@mui/joy";
import { Stack } from "@mui/system";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronRight, ContentCopy, FileDownload } from "@mui/icons-material";
import ArtifactTextEditor from "./ArtifactTextEditor";
import { useState } from "react";
import VersionControl from "./VersionControl";
import { useArtifact } from "./ArtifactProvider";
import { format } from "date-fns";
import { useCopySafe } from "../../lib/hooks/useCopySafe";
import { useDownloadAsDoc } from "../../lib/documentHooks";
import { de, enUS } from "date-fns/locale";
import { ARTIFACT_CANVAS_ID } from "../../lib/testIds";
import { twMerge } from "tailwind-merge";

interface DownloadOption {
  label: string;
  onClick: () => void;
}

interface ArtifactCanvasProps {
  embedded?: boolean;
}

export default function ArtifactCanvas({ embedded }: ArtifactCanvasProps) {
  const [shadowOpacity, setShadowOpacity] = useState<number>(0);

  const { artifact, versionIndex, isLoading, hide } = useArtifact();
  const { t, i18n } = useTranslation();
  const copy = useCopySafe();

  const version = artifact?.versions?.at(versionIndex);

  const { downloadDocument, isLoading: docLoading } = useDownloadAsDoc({
    markdown: version?.content ?? "",
    filename: `${artifact?.title}-${versionIndex}`,
  });

  const downloadOptions: DownloadOption[] = [
    {
      label: t("artifact.asPdf"),
      onClick: () => downloadDocument("pdf"),
    },
    {
      label: t("artifact.asDoc"),
      onClick: () => downloadDocument("docx"),
    },
    {
      label: t("artifact.asXlsx"),
      onClick: () => downloadDocument("xlsx"),
    },
  ];

  if (!artifact) return;

  return (
    <motion.div
      initial={{ width: "0vw", opacity: 0 }}
      animate={{ width: "45vw", opacity: 1 }}
      exit={{ width: "0vw", opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={twMerge(
        "relative flex h-full w-full flex-col",
        embedded && "fixed bottom-0 right-0 top-0 z-50 bg-white",
      )}
      data-testid={ARTIFACT_CANVAS_ID}
    >
      {/* Sticky header */}

      <Stack
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          boxShadow: `0 10px 10px -10px rgba(0, 0, 0, ${shadowOpacity})`,
        }}
      >
        {isLoading && (
          <LinearProgress
            sx={{
              position: "absolute",
              background: "transparent",
              width: "100%",
              left: 0,
              right: 0,
              top: 0,
              "--LinearProgress-thickness": "4px",
              "--LinearProgress-radius": "0px",
              "--LinearProgress-progressRadius": "2px",
            }}
          />
        )}
        <Stack direction="row" alignItems="center" px={1} pt={1.5} gap={1}>
          <IconButton onClick={hide}>
            <ChevronRight />
          </IconButton>

          <Stack>
            <Typography level="body-md" className="text-black">
              {artifact?.title}
            </Typography>
            <Typography color="neutral" level="body-xs">
              {t("artifact.createdAt", {
                date: format(new Date(version?.createdAt ?? new Date()), "PP", {
                  locale: i18n.language === "de" ? de : enUS,
                }),
              })}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ ml: "auto" }} spacing={1}>
            <DownloadButton isLoading={docLoading} options={downloadOptions} />
            <Tooltip id="button-copy" title={t("artifact.copy")}>
              <IconButton onClick={() => copy(version?.content ?? "")}>
                <ContentCopy sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{ mt: 1.5, mb: 0 }} />
      </Stack>

      {version && artifact.type === "TEXT" && (
        <ArtifactTextEditor
          onScroll={(scrollY) => setShadowOpacity(Math.min(scrollY / 100, 0.2))}
          content={version.content}
        />
      )}

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
        <VersionControl />
      </div>
    </motion.div>
  );
}

interface DownloadButtonProps {
  options: DownloadOption[];
  isLoading: boolean;
}

function DownloadButton({ options, isLoading }: DownloadButtonProps) {
  const { t } = useTranslation();
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: Button }}
        slotProps={{ root: { variant: "solid", color: "primary" } }}
        sx={{ minWidth: 100 }}
        endDecorator={!isLoading && <FileDownload />}
        loading={isLoading}
      >
        {!isLoading && t("artifact.download")}
      </MenuButton>
      <Menu>
        {options.map(({ label, onClick }) => {
          return (
            <MenuItem key={label} onClick={onClick}>
              {label}
            </MenuItem>
          );
        })}
      </Menu>
    </Dropdown>
  );
}
