import { AutoAwesome } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Grid,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import {
  useCreateWorkflow,
  useGenerateWorkflow,
  usePersonalDepartment,
  useWorkflowTemplates,
} from "../../lib/api/localHooks";
import { useEffect, useState } from "react";
import WorkflowWizardLoader from "./WorkflowWizardLoader";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "../../router";
import { useCurrentOrganizationId } from "../../lib/api/useCurrentOrganizationId";
import { CustomWorkflowCard } from "./CustomWorkflowCard";
import TemplateCard from "./TemplateCard";

interface CreateWorkflowModalProps {
  open: boolean;
  onClose: () => void;
}

const ANIMATION = { duration: 0.2, ease: "easeInOut" };

export default function CreateWorkflowModal({
  open,
  onClose,
}: CreateWorkflowModalProps) {
  const [wizardInput, setWizardInput] = useState<string>("");

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentOrgId = useCurrentOrganizationId();

  const { mutateAsync: generateWorkflow, isPending: isGenerating } =
    useGenerateWorkflow();
  const { mutateAsync: createWorkflow } = useCreateWorkflow();
  const { data: personalDepartment } = usePersonalDepartment();
  const { data: workflowTemplates } = useWorkflowTemplates(
    i18n.language.split("-")[0] ?? "en",
  );

  const wizardTemplatePrompts = [
    t("workflowModal.wizardTemplates.prosAndCons"),
    t("workflowModal.wizardTemplates.researchAndSummarize"),
    t("workflowModal.wizardTemplates.strategyPlanner"),
    t("workflowModal.wizardTemplates.decisionSupport"),
    t("workflowModal.wizardTemplates.contentRepurposing"),
    t("workflowModal.wizardTemplates.marketTrends"),
    t("workflowModal.wizardTemplates.personaCreator"),
    t("workflowModal.wizardTemplates.emailWriter"),
    t("workflowModal.wizardTemplates.ideaRefinement"),
  ];

  useEffect(() => {
    if (!open) {
      setWizardInput("");
    }
  }, [open]);

  const handleWizardCreate = async () => {
    if (wizardInput.length === 0 || isGenerating) return;
    try {
      const workflow = await generateWorkflow({
        language: i18n.language as "en" | "de",
        query: wizardInput,
      });

      if (!workflow) {
        toast.error(t("errors.workflowCreationInvalidStructure"));
        return;
      }

      void navigate("/:organizationId/workflows/:workflowId", {
        params: {
          organizationId: currentOrgId,
          workflowId: workflow.id,
        },
      });

      onClose();
    } catch (error) {
      toast.error(t("createWorkflowFailed"));
      console.error(error);
    }
  };

  const handleManualCreate = async (templateId?: string) => {
    try {
      const workflowId = await createWorkflow({
        templateId,
        name: t("unnamedWorkflow"),
        departmentId: personalDepartment?.id ?? "personal",
        index: 0,
        steps: [] // Add empty steps array as it's required by the Workflow type
      });

      if (!workflowId) {
        toast.error(t("createWorkflowFailed"));
        return;
      }

      void navigate(`/:organizationId/workflows/:workflowId`, {
        params: {
          organizationId: currentOrgId,
          workflowId,
        },
      });
      toast.success(t("createdWorkflow"));
      onClose();
    } catch (error) {
      toast.error(t("createWorkflowFailed"));
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={isGenerating ? () => {} : onClose}>
      <ModalDialog sx={{ p: 2.5, width: "800px" }}>
        {!isGenerating && <ModalClose onClick={onClose} />}
        <Stack gap={2}>
          <Typography level="title-lg">
            {t("workflowModal.workflowWizard.title")}
          </Typography>
          <Typography sx={{ mt: -1.5 }} level="body-sm">
            {t("workflowModal.workflowWizard.description")}
          </Typography>

          {!isGenerating && (
            <Box sx={{ position: "relative", mt: 2 }}>
              <Input
                value={wizardInput}
                onChange={(e) => setWizardInput(e.target.value)}
                placeholder={t("workflowModal.workflowWizard.placeholder")}
                slotProps={{
                  input: {
                    component: "textarea",
                    rows: 8,
                    style: {
                      resize: "none",
                    },
                  },
                }}
                sx={{
                  py: 1,
                  alignItems: "flex-start",
                }}
              />

              {wizardInput.length === 0 && (
                <Button
                  size="sm"
                  variant="soft"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    zIndex: 1,
                    fontSize: "0.75rem",
                    px: 1.5,
                  }}
                  onClick={() =>
                    setWizardInput(
                      wizardTemplatePrompts[
                        Math.floor(Math.random() * wizardTemplatePrompts.length)
                      ],
                    )
                  }
                >
                  {t("workflowModal.workflowWizard.tryMeOut")}
                </Button>
              )}
            </Box>
          )}

          {isGenerating && <WorkflowWizardLoader />}

          <Button
            disabled={isGenerating}
            onClick={handleWizardCreate}
            startDecorator={<AutoAwesome sx={{ fontSize: 16 }} />}
          >
            {t("workflowModal.workflowWizard.create")}
          </Button>
        </Stack>

        <motion.div
          animate={{
            opacity: isGenerating ? 0 : 1,
            marginBottom: isGenerating ? -10 : 0,
            height: isGenerating ? 0 : "auto",
          }}
          initial={false}
          transition={ANIMATION}
          style={{ overflow: "hidden" }}
        >
          <Divider sx={{ my: 2 }} />
          <Stack gap={2}>
            <Typography level="title-lg">
              {t("workflowModal.manualWorkflow.title")}
            </Typography>
            <Typography sx={{ mt: -1.5 }} level="body-sm">
              {t("workflowModal.manualWorkflow.description")}
            </Typography>

            <Grid
              container
              spacing={2}
              sx={{
                width: "100%",
                maxHeight: "40vh",
                overflow: "auto",
              }}
              mt={2}
            >
              <Grid
                xs={12}
                md={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CustomWorkflowCard onClick={() => handleManualCreate()} />
              </Grid>

              {workflowTemplates?.map(({ name, description, id }) => (
                <Grid
                  key={id}
                  xs={12}
                  md={6}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TemplateCard
                    title={name}
                    description={description ?? ""}
                    onClick={() => handleManualCreate(id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </motion.div>
      </ModalDialog>
    </Modal>
  );
}
