import { MoreVert } from "@mui/icons-material";
import { Dropdown, MenuButton } from "@mui/joy";
import { useState } from "react";
import { calcUserXP, useXP } from "../../../lib/api/gamification";
import { UserMenuList } from "./UserMenuList";
import { UserDisplay } from "./UserDisplay";
import { type SxProps } from "@mui/joy/styles/types";

export function UserMenu({
  hasLanguageSelector,
  isAcademy,
  isAvatarOnly,
  isMenuCompact,
  sx,
}: {
  hasLanguageSelector?: boolean;
  isAcademy?: boolean;
  isAvatarOnly?: boolean;
  isMenuCompact?: boolean;
  sx?: SxProps;
}) {
  const xp = useXP();
  const UserXPData = calcUserXP(xp?.xp ?? 0, 0);

  const [open, setOpen] = useState(false);

  const handleOpenChange = (
    e: React.SyntheticEvent | null,
    isOpen: boolean,
  ) => {
    const id = (e?.target as HTMLElement).id;
    if (id !== "languageSelector") {
      setOpen(isOpen);
    }
  };

  return (
    <Dropdown open={open} onOpenChange={handleOpenChange}>
      <MenuButton
        slots={{ root: isAvatarOnly ? "div" : undefined }}
        variant="plain"
        color="neutral"
        className="!p-1"
        sx={sx}
      >
        <div className="flex w-full items-center justify-between">
          <UserDisplay
            userXPData={UserXPData}
            isAcademy={isAcademy}
            isAvatarOnly={isAvatarOnly}
          />
          {!isAvatarOnly && <MoreVert />}
        </div>
      </MenuButton>
      <UserMenuList
        isMenuCompact={isMenuCompact}
        isAcademy={isAcademy}
        userXPData={UserXPData}
        hasLanguageSelector={hasLanguageSelector}
      />
    </Dropdown>
  );
}
