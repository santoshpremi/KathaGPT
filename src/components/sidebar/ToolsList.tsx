import {
  InterpreterModeOutlined,
  Language,
  Translate,
  Wallpaper,
} from "@mui/icons-material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useMemo } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "../../lib/i18n";
import { comparePath } from "../../lib/routeUtils";
import { TRANSLATE_CONTENT_SIDEBAR_BUTTON_ID } from "../../lib/testIds";
import { type Path } from "../../router";
import { useCurrentOrganizationId } from "../../lib/api/useCurrentOrganizationId";
import {
  useStartToolChat,
  type ToolKey,
} from "../../lib/hooks/useStartToolChat";
import { useNavigate } from "../../router";
import { TOOL_PATHS } from "../../lib/hooks/toolPaths";
import { CollapsableButton } from "./CollapsableButton";
import { SidebarSection } from "./SidebarSection";
import { cn } from "../../lib/cn";
import { SIDEBAR_ANIMATION_DURATION } from "./Sidebar";
import {
  useDocumentTranslationEnabled,
  useProductConfig,
  useTechSupportEnabled,
  useTextTranslationEnabled,
} from "../../lib/api/localHooks";
import { useEnabledModels } from "../../lib/api/rust";
import { useResearchModelOptions } from "../../lib/hooks/useResearchModelOptions";

export type Tool = {
  key: ToolKey;
  name: string;
  icon: React.ReactElement;
  enabled: boolean;
  path: Path;
  testId?: string;
};

export default function ToolsList({
  isSidebarOpen,
}: {
  isSidebarOpen?: boolean;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const organizationId = useCurrentOrganizationId();
  const navigate = useNavigate();
  const { startToolChat } = useStartToolChat();

  const { data: enabledModels } = useEnabledModels();
  const { hasProvider: hasResearchProvider } = useResearchModelOptions();
  const { data: productConfig } = useProductConfig();
  const { data: textTranslationEnabled } = useTextTranslationEnabled();
  const { data: documentTranslatorEnabled } = useDocumentTranslationEnabled();
  const { data: isTechSupportEnabled } = useTechSupportEnabled();

  const tools: Tool[] = useMemo(
    () =>
      (
        [
          {
            key: "imageFactory",
            name: t("generateImage"),
            icon: <Wallpaper />,
            path: TOOL_PATHS.imageFactory,
            enabled: Boolean(productConfig?.imageGeneration),
            testId: "imageGenerationSidebarButton",
          },
          {
            key: "researchAssistant",
            name: t("researchAssistant"),
            icon: <Language />,
            path: TOOL_PATHS.researchAssistant,
            enabled: hasResearchProvider,
            testId: "research-assistant-sidebar-button",
          },
          {
            key: "meetingTools",
            name: t("tools.meetingTools.title"),
            icon: <InterpreterModeOutlined />,
            path: TOOL_PATHS.meetingTools,
            enabled: Boolean(
              (productConfig?.meetingSummarizer ||
                productConfig?.meetingTranscription) &&
                enabledModels?.includes("gemini-1.5-pro"),
            ),
          },
          {
            key: "techSupport",
            name: t("techSupport.title"),
            icon: <SupportAgentIcon fontSize="small" />,
            path: TOOL_PATHS.techSupport,
            enabled: !!isTechSupportEnabled,
          },
          {
            key: "translateContent",
            name: t("translateContent"),
            icon: <Translate />,
            path: TOOL_PATHS.translateContent,
            enabled: !!textTranslationEnabled || !!documentTranslatorEnabled,
            testId: TRANSLATE_CONTENT_SIDEBAR_BUTTON_ID,
          },
        ] satisfies Tool[]
      ).filter((tool) => tool.enabled),
    [
      t,
      enabledModels,
      hasResearchProvider,
      textTranslationEnabled,
      productConfig,
      documentTranslatorEnabled,
      isTechSupportEnabled,
    ],
  );

  const isActive = (tool: Tool) => comparePath(pathname, tool.path);

  if (tools.length === 0) return null;

  return (
    <SidebarSection title={t("apps")} isSidebarOpen={!!isSidebarOpen}>
      <div
        className={cn("flex flex-col gap-0.5", !isSidebarOpen && "gap-2")}
        style={{
          transition: "all ease-out",
          transitionDuration: SIDEBAR_ANIMATION_DURATION / 2 + "ms",
          transitionDelay: isSidebarOpen
            ? "0ms"
            : SIDEBAR_ANIMATION_DURATION / 2 + "ms",
        }}
      >
        {tools.map((tool) => {
          if (!tool.enabled) return null;
          return (
            <CollapsableButton
              key={tool.name}
              isActive={isActive(tool)}
              onClick={() => {
                if (
                  tool.key === "imageFactory" ||
                  tool.key === "translateContent" ||
                  tool.key === "researchAssistant" ||
                  tool.key === "meetingTools"
                ) {
                  void navigate(tool.path, {
                    params: { organizationId },
                  });
                } else {
                  void startToolChat(tool.key);
                }
              }}
              icon={tool.icon}
              isSidebarOpen={!!isSidebarOpen}
              content={tool.name}
              data-testid={tool.testId}
              className="h-8 !min-h-0"
            />
          );
        })}
      </div>
    </SidebarSection>
  );
}
