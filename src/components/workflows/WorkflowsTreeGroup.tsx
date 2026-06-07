//src/components/workflows/WorkflowsTreeGroup.tsx
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  List,
} from "@mui/joy";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { type Workflow } from "@workflow/workflowTypes"; 
//import { type Workflow } from "@backend/api/workflow/workflowTypes";
import { useTranslation } from "../../lib/i18n";
import { twMerge } from "tailwind-merge";
import { WorkflowItem } from "../sidebar/workflows/WorkflowItem";
import { useEffect, useRef, useState } from "react";
export function WorkflowsTreeGroup({
  title,
  workflows,
  isFavorite,
  children,
  isMoveDisabled,
  departmentId,
}: {
  title: string;
  workflows: Workflow[];
  isFavorite: (workflowId?: string) => boolean; // isFavorite() returns true if it is the favorite workflow group
  children?: React.ReactNode;
  isMoveDisabled?: boolean;
  departmentId: string;
}) {
  const { t } = useTranslation();
  const isSetUp = useRef(isFavorite());

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isSetUp.current) {
      setIsOpen(true);
    } else {
      isSetUp.current = true;
    }
  }, [setIsOpen, workflows.length]);

  return (
    <Droppable
      droppableId={departmentId}
      isCombineEnabled={false}
      isDropDisabled={isMoveDisabled}
    >
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={twMerge(
              "rounded border border-transparent",
              snapshot.isDraggingOver && "border-gray-600 bg-gray-300",
            )}
          >
            <Accordion
              expanded={isOpen}
              onChange={(_, isAccordionOpen) => setIsOpen?.(isAccordionOpen)}
            >
              <AccordionSummary
                slotProps={{
                  indicator: {
                    sx: {
                      marginRight: 0.5,
                    },
                  },
                  button: {
                    sx: {
                      fontWeight: 400,
                      flexDirection: "row-reverse",
                      justifyContent: "flex-end",
                      gap: 0,
                      p: 0,
                      pl: 0.5,
                      backgroundColor: snapshot.isDraggingOver
                        ? "inherit !important"
                        : undefined,
                    },
                  },
                }}
              >
                <div className="flex items-center justify-between pl-2">
                  <Typography level="body-sm" color="neutral">
                    {title}
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ "& > div": { py: 0.5 } }}>
                <List size="sm" className="gap-2">
                  {children}
                  {workflows
                    .sort((a, b) => a.index - b.index)
                    .map(({ id: workflowId }, i) => (
                      <Draggable
                        draggableId={workflowId}
                        index={i}
                        key={workflowId}
                        isDragDisabled={isMoveDisabled}
                      >
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.dragHandleProps}
                            {...providedDraggable.draggableProps}
                          >
                            <WorkflowItem
                              workflowId={workflowId}
                              key={workflowId}
                              isFavorite={isFavorite(workflowId)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {!children && workflows.length === 0 && (
                    <Typography
                      className="!line-clamp-2"
                      level="body-sm"
                      color="neutral"
                      sx={{
                        fontStyle: "italic",
                        ml: 3.3,
                      }}
                    >
                      {isFavorite() ? t("noFavorites") : t("noWorkflows")}
                    </Typography>
                  )}
                  {workflows.length > 0 && provided.placeholder}
                </List>
              </AccordionDetails>
            </Accordion>
          </div>
        );
      }}
    </Droppable>
  );
}
