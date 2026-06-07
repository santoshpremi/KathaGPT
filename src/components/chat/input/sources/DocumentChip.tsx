import { InsertDriveFile } from "@mui/icons-material";
import { Chip, ChipDelete, Tooltip } from "@mui/joy";
import { useTranslation } from "react-i18next";
import { ClipLoader } from "react-spinners";
import { usePrimaryColor } from "../../../../lib/hooks/useTheme";
import { useDocumentHeader } from "../../../../lib/api/documents";
import { splitByExtension, readableFileSize } from "../../../../lib/util";
import { DelayedLoader } from "../../../util/DelayedLoader";

interface DocumentPreviewProps {
  title: string;
  tooltip: string;
  onRemove?: () => void;
}

export function DocumentChip(
  props:
    | {
        documentId: string;
        onRemove?: () => void;
        loading?: false;
      }
    | {
        loading: true;
      },
) {
  const { t } = useTranslation();
  const primaryColor = usePrimaryColor();

  if (props.loading)
    return (
      <Chip
        variant="outlined"
        className="whitespace-nowrap"
        sx={{ px: 1.5, py: 0.5, "--Icon-fontSize": "18px" }}
        startDecorator={<ClipLoader size={18} color={primaryColor} />}
      >
        {t("loading")}...
      </Chip>
    );

  return <UploadedDocumentPreview {...props} />;
}

function UploadedDocumentPreview({
  documentId,
  onRemove,
}: {
  documentId: string;
  onRemove?: () => void;
}) {
  const header = useDocumentHeader(documentId);

  if (!header) return <DelayedLoader />;

  const [fileName, fileExtension] = splitByExtension(header.fileName);

  const fileNameCapped =
    fileName.length > 30 ? fileName.slice(0, 20) + "... " : fileName;

  const fileSize = readableFileSize(header.originalSize);

  return (
    <DocumentPreview
      tooltip={`${fileName}.${fileExtension} (${fileSize})`}
      onRemove={onRemove}
      title={`${fileNameCapped}.${fileExtension}`}
    />
  );
}

export function DocumentPreview({
  tooltip,
  title,
  onRemove,
}: DocumentPreviewProps) {
  return (
    <Tooltip title={tooltip}>
      <Chip
        variant="outlined"
        sx={{
          px: 1.5,
          py: 0.5,
          "--Icon-fontSize": "18px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
        startDecorator={<InsertDriveFile color="primary" />}
        endDecorator={
          onRemove && (
            <ChipDelete
              onDelete={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            />
          )
        }
      >
        {title}
      </Chip>
    </Tooltip>
  );
}
