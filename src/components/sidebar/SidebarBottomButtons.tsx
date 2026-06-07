import {
  SchoolOutlined,
  AssistantOutlined,
  LiveHelpOutlined,
} from "@mui/icons-material";
import { type Path } from "../../router";
import { useTranslation } from "../../lib/i18n";
import { useOrganization } from "../../lib/api/organization";
import { CollapsableButton } from "./CollapsableButton";
import { useProductConfig } from "../../lib/api/localHooks";
import { useLocation } from "react-router";
import { comparePath } from "../../lib/routeUtils";
import { cn } from "../../lib/cn";
import { SIDEBAR_ACADEMY_BUTTON_ID } from "../../lib/testIds";
import { useStartToolChat } from "../../lib/hooks/useStartToolChat";

export interface BottomButton {
  icon: JSX.Element;
  content: string;
  doesRender: boolean;
  path?: Path;
  onClick?: () => void;
  testId?: string;
}

export function SidebarBottomButtons({
  setOpenHelpCenter,
  isSidebarOpen,
}: {
  setOpenHelpCenter: (open: boolean) => void;
  isSidebarOpen: boolean;
}) {
  const { t } = useTranslation();
  const organization = useOrganization();
  const { data: productConfig } = useProductConfig();
  const pathname = useLocation().pathname;
  const { startToolChat } = useStartToolChat();

  const bottomButtons: BottomButton[] = [
    {
      icon: <SchoolOutlined />,
      content: t("e-learning"),
      doesRender: false,
      path: "/:organizationId/learn/:workshopId",
      testId: SIDEBAR_ACADEMY_BUTTON_ID,
    },
    {
      icon: <AssistantOutlined />,
      content: t("personalAssistant.titleNotPersonal"),
      doesRender: Boolean(productConfig?.personalAssistant),
      onClick: () => void startToolChat("personalAssistant"),
    },
    {
      icon: <LiveHelpOutlined />,
      doesRender: true,
      content: t("helpAndFeedback"),
      onClick: () => {
        setOpenHelpCenter(true);
      },
    },
  ];
  const params = {
    organizationId: organization?.id ?? "",
    workshopId: organization?.defaultWorkshopId ?? "",
  };
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-0 transition-all duration-300",
        !isSidebarOpen && "gap-2",
      )}
    >
      {bottomButtons.map((button) => {
        if (!button.doesRender) return null;
        return (
          <CollapsableButton
            key={button.content}
            isSidebarOpen={isSidebarOpen}
            to={button.onClick ? undefined : button.path}
            params={button.path ? params : undefined}
            isActive={button.path ? comparePath(pathname, button.path) : false}
            icon={button.icon}
            content={button.content}
            onClick={button.onClick}
            data-testid={button.testId}
          />
        );
      })}
    </div>
  );
}
