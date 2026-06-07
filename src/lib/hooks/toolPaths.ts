import type { Path } from "../../router";
import type { ToolKey } from "./useStartToolChat";

export const TOOL_PATHS: Record<ToolKey, Path> = {
  imageFactory: "/:organizationId/tools/imageFactory",
  researchAssistant: "/:organizationId/tools/researchAssistant",
  meetingTools: "/:organizationId/tools/meetingTools",
  techSupport: "/:organizationId/tools/techSupport",
  translateContent: "/:organizationId/tools/translateContent",
  personalAssistant: "/:organizationId/tools/personalAssistant",
};

export function pathToToolKey(path: Path): ToolKey | null {
  const entry = Object.entries(TOOL_PATHS).find(([, p]) => p === path);
  return entry ? (entry[0] as ToolKey) : null;
}
