import { List, Typography } from "@mui/joy";
import { History } from "@mui/icons-material";
import { useLocation } from "react-router";
import { useChatList } from "../../../lib/api/rust";
import { useCurrentOrganizationId } from "../../../lib/api/useCurrentOrganizationId";
import { comparePath } from "../../../lib/routeUtils";
import { ALL_CHATS_BUTTON_ID } from "../../../lib/testIds";
import { DelayedLoader } from "../../util/DelayedLoader";
import { SidebarSection } from "../SidebarSection";
import { ChatsListItem } from "./ChatsListItem";
import { useNavigate, useParams, type Path } from "../../../router";
import { useTranslation } from "../../../lib/i18n";
import { LeafItem } from "../tree/LeafItem";
import type { ChatListItem } from "@backend/api/chat/chatTypes";

const DEFAULT_LAST_CHATS_NUMBER = 3;

export function ChatsList({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const { t } = useTranslation();
  const pathname = useLocation().pathname;
  const params = useParams("/:organizationId");
  const navigate = useNavigate();

  const organizationId = useCurrentOrganizationId();
  const { data: chatsData, isLoading } = useChatList(
    DEFAULT_LAST_CHATS_NUMBER,
    organizationId,
  );

  const isActive = (path: Path) => comparePath(pathname, path);

  if (isLoading) return <DelayedLoader />;

  if (!chatsData?.items) return null;

  const lastChats = chatsData.items;
  return (
    <SidebarSection title={t("lastChats")} isSidebarOpen={!!isSidebarOpen}>
      <div>
        {lastChats.length === 0 && (
          <Typography
            level="body-xs"
            color="neutral"
            sx={{ px: 1, mb: 1, fontStyle: "italic" }}
          >
            {t("noChats")}
          </Typography>
        )}
        <List className="!mt-1 gap-2 !p-0" size="sm">
          {lastChats.map((chat: ChatListItem) => (
            <ChatsListItem key={chat.id} chat={chat} />
          ))}
          <LeafItem
            isSelected={isActive("/:organizationId/chats")}
            key={t("sidebar.allChats")}
            icon={
              <History
                color={
                  isActive("/:organizationId/chats") ? "primary" : undefined
                }
              />
            }
            onClick={() =>
              navigate("/:organizationId/chats", {
                params: { organizationId: params.organizationId },
              })
            }
            name={t("sidebar.allChats")}
            testId={ALL_CHATS_BUTTON_ID}
            singleLine
          />
        </List>
      </div>
    </SidebarSection>
  );
}
