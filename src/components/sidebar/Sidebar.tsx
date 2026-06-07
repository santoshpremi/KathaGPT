// src/components/sidebar/Sidebar.tsx
import {
  AutoAwesome,
  ChatBubbleOutline,
  ChevronLeft,
  ChevronRight,
  LibraryBooksOutlined,
  PlayCircleOutline,
  SchoolOutlined,
} from "@mui/icons-material";
import { Divider, IconButton } from "@mui/joy";
import Sheet from "@mui/joy/Sheet";
import { useState } from "react";
import { useLocation } from "react-router";
import { HelpCenterModal } from "../util/HelpCenterModal";
import { useOrganization } from "../../lib/api/organization";
import { useTranslation } from "react-i18next";
import {
  SIDEBAR_TOGGLE_BUTTON_ID,
  SIDEBAR_USER_SECTION_ID,
  SIDEBAR_ID,
  SIDEBAR_NEW_CHAT_BUTTON_ID,
} from "../../lib/testIds";
import { KathGPTBrand } from "../branding/KathGPTBrand";
import SidebarSectionWithHistory from "./tree/SidebarSectionWithHistory";
import ToolsList from "./ToolsList";
import { CollapsableButton } from "./CollapsableButton";
import { UserMenu } from "../auth/userMenu/UserMenu";
import { SidebarBottomButtons } from "./SidebarBottomButtons";
import { Link } from "../../router";
import { SidebarWorkflows } from "./workflows/SidebarWorkflows";
import { ChatsList } from "./chats/ChatsList";
import { cn } from "../../lib/cn";
import { useNewChat } from "../../lib/hooks/useNewChat";

// If changed, sidebarState.spec.ts needs to be updated accordingly
export const SIDEBAR_ANIMATION_DURATION = 200; //in ms
export const SIDEBAR_WIDTH = 270; // in px
export const SIDEBAR_COLLAPSED_WIDTH = 60; // in px
export const SIDEBAR_PADDING = 12; // in px

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (o: boolean) => void;
}) {
  const { t } = useTranslation();

  const [openHelpCenter, setOpenHelpCenter] = useState(false);

  const organization = useOrganization();
  const { startNewChat } = useNewChat();
  const pathname = useLocation().pathname;

  return (
    <Sheet
      className="Sidebar"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 20,
        pb: 2,
        position: "sticky",
        height: "100dvh",
        width: isSidebarOpen
          ? SIDEBAR_WIDTH + "px"
          : SIDEBAR_COLLAPSED_WIDTH + "px",
        borderColor: "divider",
        transition: "width ease-out",
        transitionDuration: SIDEBAR_ANIMATION_DURATION + "ms",
        borderRight: "1px solid",
        boxShadow: "none",
      }}
      id="sidebar"
      data-testid={SIDEBAR_ID}
    >
      <HelpCenterModal open={openHelpCenter} setOpen={setOpenHelpCenter} />
      {/* Logo */}
      <div className="top-0 z-50 bg-[var(--joy-palette-background-surface)] px-2 pt-3">
        <div
          className="flex items-center justify-between gap-2"
          style={{
            minHeight: "2.5rem",
            transition: "all ease-out",
            transitionDuration: SIDEBAR_ANIMATION_DURATION + "ms",
          }}
        >
          <Link
            to="/:organizationId"
            params={{ organizationId: organization?.id ?? "" }}
            className="min-w-0 flex-1 overflow-hidden"
          >
            <KathGPTBrand
              compact={!isSidebarOpen}
              markClassName={isSidebarOpen ? "h-8 w-8" : "h-7 w-7"}
            />
          </Link>

          <IconButton
            data-testid={SIDEBAR_TOGGLE_BUTTON_ID}
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
            }}
            sx={{ fontSize: "1.5rem" }}
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
        <Divider
          sx={{
            mt: 1,
            mb: isSidebarOpen ? 1 : 3,
            transition: "all ease-out",
            transitionDuration: SIDEBAR_ANIMATION_DURATION + "ms",
          }}
        />
      </div>
      {/* Upper Sidebar */}
      <div
        className="flex w-full flex-grow flex-col gap-4 overflow-y-auto overflow-x-hidden"
        style={{
          padding: `0 ${SIDEBAR_PADDING}px`,
          paddingBottom: "1.5rem",
        }}
      >
        {/* Primary nav — tight spacing like ToolsList */}
        <div className="flex flex-col gap-0">
          <CollapsableButton
            icon={<AutoAwesome />}
            isSidebarOpen={isSidebarOpen}
            content={t("newChat")}
            onClick={() => void startNewChat()}
            variant="plain"
            color="neutral"
            className="!font-medium"
            data-testid={SIDEBAR_NEW_CHAT_BUTTON_ID}
          />

          <CollapsableButton
            icon={<LibraryBooksOutlined />}
            isSidebarOpen={isSidebarOpen}
            content={t("promptLibrary.nav")}
            to="/:organizationId/prompt-library"
            params={{ organizationId: organization?.id ?? "" }}
            isActive={pathname.includes("/prompt-library")}
            variant="plain"
            color="neutral"
          />

          {organization?.defaultWorkshopId && (
            <CollapsableButton
              icon={<SchoolOutlined />}
              isSidebarOpen={isSidebarOpen}
              content={t("learnAndExplore")}
              to="/:organizationId/learn/:workshopId"
              params={{
                organizationId: organization.id,
                workshopId: organization.defaultWorkshopId,
              }}
              variant="plain"
              color="neutral"
            />
          )}
        </div>

<SidebarSectionWithHistory
  isSidebarOpen={isSidebarOpen}
  content={<ChatsList isSidebarOpen={isSidebarOpen} />}
  icon={<ChatBubbleOutline />}
  historyPath="/:organizationId/chats"
  params={{ organizationId: organization?.id ?? "" }}
  tooltipContent={t("sidebar.allChats")}
/>

{!isSidebarOpen && <Divider />}

<ToolsList isSidebarOpen={isSidebarOpen} />

{!isSidebarOpen && <Divider />}

<SidebarSectionWithHistory
  isSidebarOpen={isSidebarOpen}
  content={<SidebarWorkflows isSidebarOpen={isSidebarOpen} />}
  icon={<PlayCircleOutline />}
  historyPath="/:organizationId/workflows"
  params={{ organizationId: organization?.id ?? "" }}
  tooltipContent={t("sidebar.allWorkflows")}
/> 

        
      </div>

      {/* Lower Sidebar */}
      <div
        className="z-10 flex min-h-fit w-full flex-shrink-0 flex-col gap-3 overflow-x-hidden"
        style={{
          boxShadow: "var(--joy-palette-background-surface) -15px -5px 5px 0px",
          padding: `0 ${SIDEBAR_PADDING}px`,
        }}
      >
        <SidebarBottomButtons
          setOpenHelpCenter={setOpenHelpCenter}
          isSidebarOpen={isSidebarOpen}
        />
        <Divider />

        <div
          style={{
            marginLeft: isSidebarOpen ? 0 : "-6px",
            transitionDuration: SIDEBAR_ANIMATION_DURATION + "ms",
          }}
          data-testid={SIDEBAR_USER_SECTION_ID}
        >
          <UserMenu
            isMenuCompact={false}
            hasLanguageSelector
            isAvatarOnly={!isSidebarOpen}
            sx={{ width: "100%" }}
          />
        </div>
      </div>
    </Sheet>
  );
}
