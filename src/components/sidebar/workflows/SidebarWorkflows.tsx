import { Add, Search } from "@mui/icons-material";
import { IconButton, Tooltip, Input, Stack } from "@mui/joy";
import { t } from "i18next";
import { useRef, useState } from "react";
import { WorkflowsTree } from "../../workflows/WorkflowsTree";
import { SidebarSection } from "../SidebarSection";
import CreateWorkflowModal from "../../workflows/CreateWorkflowModal";

export function SidebarWorkflows({
  isSidebarOpen,
}: {
  isSidebarOpen: boolean;
}) {
  const [isWorkflowWizardOpen, setIsWorkflowWizardOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  if (!isSearchVisible && searchValue) setSearchValue("");

  return (
    <SidebarSection
      id="sidebarWorkflowsSection"
      title={t("workflows")}
      isSidebarOpen={!!isSidebarOpen}
      actions={
        <Stack direction="row" gap={0.5}>
          <IconButton
            size="sm"
            data-testid="create-workflow-button"
            onClick={() => setIsWorkflowWizardOpen(true)}
          >
            <Add fontSize="small" />
          </IconButton>
          <Tooltip title={t("search")} placement="top" arrow>
            <IconButton
              size="sm"
              variant={isSearchVisible ? "solid" : "plain"}
              color={isSearchVisible ? "primary" : "neutral"}
              onClick={() => {
                setIsSearchVisible((prev) => !prev);
                setSearchValue("");
                !isSearchVisible && searchBarRef.current?.focus();
              }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
    >
      <div
        className="transition-all"
        style={{
          height: isSearchVisible ? "auto" : "0",
          opacity: isSearchVisible ? 1 : 0,
          margin: isSearchVisible ? "0.3rem 0" : "-0.1rem 0",
        }}
      >
        <Input
          type="text"
          size="sm"
          placeholder={t("search")}
          slotProps={{
            input: {
              ref: searchBarRef,
            },
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsSearchVisible(false);
              setSearchValue("");
            }
          }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <WorkflowsTree searchValue={searchValue} />
      <CreateWorkflowModal
        open={isWorkflowWizardOpen}
        onClose={() => setIsWorkflowWizardOpen(false)}
      />
    </SidebarSection>
  );
}
