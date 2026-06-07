import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, IconButton, Tooltip, Typography } from "@mui/joy";
import { DocumentChip } from "../chat/input/sources/DocumentChip";
import { AddCircle, Attachment } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { SxProps } from "@mui/system";
import {
  MIME_TYPE_TO_EXTENSIONS_MAP,
  getMimeListFromMap,
  getExtensionsFromMimeMap,
} from "@backend/constants/mime";

import { useUploadDocumentWithToast } from "../../lib/api/documents";
interface DocumentDropzoneProps {
  style?: SxProps;
  documentIds?: string[];
  customMime?: Record<string, string[]>;
  allowMultiple?: boolean;
  setDocumentIds?: Dispatch<SetStateAction<string[]>>;
  onSelect?: (files: File[]) => void;
}

const MAX_EXTENSIONS_VISIBLE = 10;

export function DocumentDropzone({
  style,
  documentIds = [],
  customMime,
  allowMultiple = true,
  setDocumentIds,
  onSelect,
}: DocumentDropzoneProps) {
  const [numLoading, setNumLoading] = useState(0);

  const { t } = useTranslation();
  const uploadDocument = useUploadDocumentWithToast();

  const mimeMap = customMime ?? MIME_TYPE_TO_EXTENSIONS_MAP;
  const mimeList = getMimeListFromMap(mimeMap).join(", ");
  const mimeExtensions = getExtensionsFromMimeMap(mimeMap);
  const empty = documentIds.length === 0 && numLoading === 0;

  const onDrop = async (files: File[]) => {
    if (!allowMultiple && documentIds.length > 0) {
      return;
    }

    if (onSelect) {
      return onSelect(files);
    }

    setNumLoading((prev) => prev + files.length);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedFile = await uploadDocument(file);

        if (documentIds.includes(uploadedFile.id)) {
          toast.info(t("documents.alreadyUploaded"));
        } else {
          setDocumentIds?.((prev) => [...prev, uploadedFile.id]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setNumLoading((prev) => prev - 1);
      }
    }
    setNumLoading(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mimeMap,
    maxFiles: allowMultiple ? undefined : 1,
    disabled: allowMultiple && (documentIds.length > 0 || numLoading > 0),
    multiple: allowMultiple,
    useFsAccessApi: false,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Card
        sx={{ height: "100%", cursor: "pointer", ...style }}
        variant={isDragActive ? "soft" : "outlined"}
        color={isDragActive ? "primary" : "neutral"}
        className="transition-all"
      >
        <input
          id="dropzoneInput"
          {...getInputProps()}
          accept={mimeList}
          disabled={
            !allowMultiple && (documentIds.length > 0 || numLoading > 0)
          }
          onChange={async (e) => {
            await onDrop((e.target.files ?? []) as File[]);
          }}
        />
        {!empty ? (
          <div className="flex flex-row flex-wrap items-center gap-2">
            {documentIds.map((docId) => (
              <DocumentChip
                key={docId}
                documentId={docId}
                onRemove={async () =>
                  setDocumentIds?.((prev) => prev.filter((id) => id !== docId))
                }
              />
            ))}
            {new Array(numLoading).fill({}).map((_, i) => (
              <DocumentChip key={i} loading />
            ))}
            {allowMultiple && (
              <IconButton
                onClick={() => {
                  (
                    document.querySelector("#dropzoneInput") as HTMLElement
                  )?.click();
                }}
              >
                <AddCircle color="primary" />
              </IconButton>
            )}
          </div>
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-lg"
            style={{
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              "--Icon-fontSize": "30px",
            }}
          >
            <Attachment fontSize="large" />
            <Typography level="body-md" textAlign="center">
              {t("documents.dropzoneEmpty")}
            </Typography>
            {customMime && (
              <Tooltip
                title={t("allowedFiles", {
                  formats: mimeExtensions.join(", "),
                  count: mimeExtensions.length,
                })}
              >
                <Typography level="body-sm">
                  {t("allowedFiles", {
                    formats: mimeExtensions
                      .slice(0, MAX_EXTENSIONS_VISIBLE)
                      .join(", "),
                    count: mimeExtensions.length,
                  })}
                  {mimeExtensions.length > MAX_EXTENSIONS_VISIBLE && (
                    <span>
                      {t("andMore", {
                        extra: mimeExtensions.length - MAX_EXTENSIONS_VISIBLE,
                      })}
                    </span>
                  )}
                </Typography>
              </Tooltip>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
