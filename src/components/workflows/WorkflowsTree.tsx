//
import { AccordionGroup, Typography } from "@mui/joy";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { DelayedLoader } from "../util/DelayedLoader";
import { WorkflowsTreeGroup } from "./WorkflowsTreeGroup";
import {
  useDepartments,
  useFavoriteWorkflows,
  useToggleWorkflowFavorite,
  useUpdateWorkflowDepartment,
} from "../../lib/api/localHooks";
import { useTranslation } from "../../lib/i18n";
import { DemoWorkflowItem } from "./demo/DemoWorkflowItem";
import type { Department } from "@backend/api/organization/departmentTypes";
import type { Workflow } from "@backend/api/workflow/workflowTypes";
export const FAVORITE_DEPARTMENT_ID = "FAVORITE_DEPARTMENT";
export const DEMO_DEPARTMENT_ID = "DEMO_DEPARTMENT";

export function WorkflowsTree({ searchValue }: { searchValue: string }) {
  const { t } = useTranslation();
  const { data: departments } = useDepartments();
  const { data: favoriteWorkflows } = useFavoriteWorkflows();
  const { mutateAsync: toggleFavorite } = useToggleWorkflowFavorite();
  const { mutateAsync: updateWorkflowDepartmentAndPosition } =
    useUpdateWorkflowDepartment();

  const filteredDepartments = useMemo(() => {
    if (searchValue.trim() === "") return departments;

    const departmentsWithFilteredWorkflows = departments?.map((department) => {
      const fuse = new Fuse(department.workflows, {
        keys: ["name", "description"],
      });

      const filteredWorkflows = fuse
        .search(searchValue.trim())
        .map((result) => result.item);

      return {
        ...department,
        workflows: filteredWorkflows,
      };
    });

    return departmentsWithFilteredWorkflows?.filter(
      (department) => department.workflows.length > 0,
    );
  }, [departments, searchValue]);

  if (!departments) return <DelayedLoader />;

  async function moveWorkflowToDepartment(
    workflowId: string,
    sourceDepartmentId: string,
    targetDepartmentId: string,
    index: number,
  ) {
    if (
      sourceDepartmentId === FAVORITE_DEPARTMENT_ID ||
      targetDepartmentId === FAVORITE_DEPARTMENT_ID
    ) {
      await toggleFavorite(workflowId);
      toast.success(t("workflowMoved"));
    }
    if (targetDepartmentId !== FAVORITE_DEPARTMENT_ID) {
      return updateWorkflowDepartmentAndPosition({
        workflowId,
        departmentId: targetDepartmentId,
        index,
      });
    }
  }

  return (
    <div className="max-w-xs">
      <DragDropContext
        onDragEnd={(result) => {
          if (
            !result.destination ||
            !result.source ||
            (result.destination.droppableId === result.source.droppableId &&
              result.destination.index === result.source.index)
          )
            return;

          moveWorkflowToDepartment(
            result.draggableId,
            result.source.droppableId,
            result.destination.droppableId,
            result.destination.index,
          ).catch((e) => {
            console.error(e);
          });
        }}
      >
        <AccordionGroup disableDivider>
          <WorkflowsTreeGroup
            title="Demo Workflow"
            workflows={[]}
            isMoveDisabled
            departmentId={DEMO_DEPARTMENT_ID}
            isFavorite={() => false}
          >
            <DemoWorkflowItem />
          </WorkflowsTreeGroup>
          <WorkflowsTreeGroup
            departmentId={FAVORITE_DEPARTMENT_ID}
            isFavorite={() => true}
            title={t("favorites")}
            workflows={
              favoriteWorkflows?.map((workflow) => ({
                ...workflow,
                createdAt: new Date(workflow.createdAt),
                updatedAt: new Date(workflow.updatedAt),
              })) ?? []
            }
          />
          {filteredDepartments?.map((department) => (
            <WorkflowsTreeGroup
              key={department.id}
              departmentId={department.id}
              title={
                department.isPersonal ? t("personalArea") : department.name
              }
              workflows={department.workflows.map((workflow) => ({
                ...workflow,
                createdAt: new Date(workflow.createdAt),
                updatedAt: new Date(workflow.updatedAt),
              }))}
              isMoveDisabled={!department.writePermission}
            isFavorite={(workflowId) =>
                !!favoriteWorkflows?.some((wf) => wf.id === workflowId)
              }
            />
          ))}
        </AccordionGroup>
      </DragDropContext>
      {filteredDepartments?.length === 0 && (
        <div className="p-4">
          <Typography level="body-sm" fontStyle="italic">
            {t("noResults")}
          </Typography>
        </div>
      )}
    </div>
  );
}
