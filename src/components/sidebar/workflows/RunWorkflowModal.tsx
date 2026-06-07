import {
  Stack,
  Modal,
  ModalDialog,
  Typography,
  Button,
  ModalClose,
  ModalOverflow,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Option,
} from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import { useMemo, useState } from "react";
import { Form } from "react-router";

import { useTranslation } from "../../../lib/i18n";
import { useDocumentIntelligenceEnabled } from "../../../lib/api/localHooks";
import {
  CODE_MIME_TYPE_TO_EXTENSIONS_MAP,
  MIME_TYPE_TO_EXTENSIONS_MAP,
  mergeMimeMaps,
} from "@backend/constants/mime";
import { DocumentDropzone } from "../../util/DocumentDropzone";
import { MarkdownRenderer } from "../../chat/markdown/MarkdownRenderer";

interface WorkflowOption {
  label: string;
  value: string;
}

interface WorkflowInput {
  key: string;
  name: string;
  type: "short_text" | "long_text" | "enum" | "toggle";
  placeholder?: string;
  options: WorkflowOption[];
}

interface RunWorkflowModalProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    inputs?: WorkflowInput[];
    allowDocumentUpload?: boolean;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (values: Record<string, string>, documentIds: string[]) => void;
  isDemo?: boolean;
}

export function RunWorkflowModal({
  workflow,
  open,
  setOpen,
  onSubmit,
  isDemo,
}: RunWorkflowModalProps) {
  const { t } = useTranslation();

  const [values, setValues] = useState<Record<string, string>>({});

  const [attachedDocumentIds, setAttachedDocumentIds] = useState<string[]>([]);

  const { data: documentIntelligenceEnabled } =
    useDocumentIntelligenceEnabled();

  const validInput = useMemo(() => {
    return (
      Object.keys(values).filter((val) => values[val] !== "").length ===
      workflow.inputs?.length
    );
  }, [workflow, values]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalOverflow>
        <ModalDialog
          id={isDemo ? "demoRunWorkflowModal" : undefined}
          sx={{
            width: "60vw",
            height: "60vh",
          }}
        >
          <ModalClose />

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(values, attachedDocumentIds);
            }}
          >
            <Stack spacing={3}>
              <div className="flex flex-col gap-1">
                <Typography level="h4">{workflow.name}</Typography>
                <Typography level="body-md">
                  <MarkdownRenderer
                    content={workflow.description ?? ""}
                  ></MarkdownRenderer>
                </Typography>
              </div>
              {workflow.allowDocumentUpload && documentIntelligenceEnabled && (
                <FormControl>
                  <FormLabel>{t("documents.documents")}</FormLabel>
                  <DocumentDropzone
                    customMime={mergeMimeMaps([
                      MIME_TYPE_TO_EXTENSIONS_MAP,
                      CODE_MIME_TYPE_TO_EXTENSIONS_MAP,
                    ])}
                    documentIds={attachedDocumentIds}
                    setDocumentIds={setAttachedDocumentIds}
                  />
                </FormControl>
              )}
              {(workflow.inputs ?? []).map((input) => {
                return (
                  <WorkflowInputField
                    input={input}
                    key={input.key}
                    value={values[input.key]}
                    onChange={(value) => {
                      setValues((v) => ({
                        ...v,
                        [input.key]: value,
                      }));
                    }}
                  />
                );
              })}
              <Button type="submit" disabled={!validInput}>
                {t("execute")}
              </Button>
            </Stack>
          </Form>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}

export function WorkflowInputField({
  input,
  value,
  onChange,
}: {
  input: WorkflowInput;
  value: string;
  onChange: (value: string) => void;
}) {
  const [fieldVisible, setFieldVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  if (input.type === "short_text")
    return (
      <FormControl>
        <FormLabel>{input.name}</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={input.placeholder || t("workflowEditor.input")}
        />
      </FormControl>
    );

  if (input.type === "long_text")
    return (
      <FormControl>
        <FormLabel>{input.name}</FormLabel>
        <Textarea
          minRows={3}
          maxRows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("input")}
        />
      </FormControl>
    );

  if (input.type === "enum")
    return (
      <Stack direction="row" display="flex" alignItems="end" spacing={1}>
        <FormControl className="flex-1">
          <FormLabel>{input.name}</FormLabel>
          <Select
            placeholder={input.placeholder || t("workflowEditor.choose")}
            onChange={(_, selectedValue) => {
              if (!selectedValue) return;

              if (selectedValue === "custom-input") {
                setFieldVisible(true);
                return;
              }

              setFieldVisible(false);
              onChange(selectedValue);
            }}
            value={fieldVisible ? "custom-input" : value}
          >
            {input.options.map((option: WorkflowOption) => (
              <Option value={option.value} key={option.value + option.label}>
                {option.label}
              </Option>
            ))}

            <Option value="custom-input">
              <EditIcon sx={{ width: 16, height: 16 }} />
              {t("custom")}
            </Option>
          </Select>
        </FormControl>
        {fieldVisible && (
          <FormControl sx={{ minWidth: "70%" }}>
            <Input
              sx={{ mt: 1 }}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("input")}
            />
          </FormControl>
        )}
      </Stack>
    );

  if (input.type === "toggle") {
    let options = input.options;
    if (options.length !== 2) {
      options = [
        { label: t("on"), value: "on" },
        { label: t("off"), value: "off" },
      ];
    }

    options = options.map((option: WorkflowOption) => ({
      ...option,
      value: option.value === "" ? " " : option.value,
    }));

    if (value === undefined || value === null) {
      onChange(options[1].value);
    }

    return (
      <FormControl>
        <FormLabel>{input.name}</FormLabel>
        <ButtonGroup>
          {options.map((state: WorkflowOption) => (
            <Button
              variant={state.value === value ? "solid" : "soft"}
              color={state.value === value ? "primary" : "neutral"}
              key={input.name + state.value}
              onClick={() => {
                onChange(state.value);
              }}
            >
              {state.label}
            </Button>
          ))}
        </ButtonGroup>
      </FormControl>
    );
  }

  return null;
}
