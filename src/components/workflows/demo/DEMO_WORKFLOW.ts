import type { Workflow } from "@backend/api/workflow/workflowTypes";

interface WorkflowInput {
  key: string;
  name: string;
  type: string;
  options: Array<{ value: string; label: string }>;
}

export const DEMO_WORKFLOW: Workflow & {
  inputs: WorkflowInput[];
} = {
  id: "demo",
  name: "Demo Workflow",
  createdAt: new Date(),
  updatedAt: new Date(),
  index: 0,
  departmentId: "demo",
  description:
    "This is a demo workflow that helps users plan an unforgettable flight matching their specified country and budget.",
  steps: [
    {
      id: "step1",
      order: 0,
      promptTemplate:
        "Plan an unforgettable flight to {{destination}} for {{duration}} with a budget of {{budget}}.",
      modelOverride: null,
    },
    {
      id: "step2",
      order: 1,
      promptTemplate:
        "Tell the user in one sentence that they can create their own workflow.",
      modelOverride: null,
    },
  ],
  inputs: [
    { key: "budget", name: "Budget", type: "short_text", options: [] },
    { key: "destination", name: "Destination", type: "short_text", options: [] },
    { key: "duration", name: "Duration", type: "short_text", options: [] },
  ],
};
