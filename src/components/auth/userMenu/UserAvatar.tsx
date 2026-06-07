import { Avatar } from "@mui/joy";
import { type ComponentProps } from "react";
import { type UserXP } from "../../../lib/api/gamification";
import { useUser } from "../../../lib/api/user";
import { NEUTRAL_USER_AVATAR_SX } from "../../../shared/constants/avatars";
import { AvatarWithProgressAndLevel } from "../../gamification/AvatarWithXP";

export function UserAvatar({
  userId,
  showXP = false,
  userXPData,
  ...rest
}: {
  userId?: string | null;
  showXP?: boolean;
  userXPData?: UserXP;
} & ComponentProps<typeof Avatar>) {
  const user = useUser(userId ?? "me");

  if (!user) return <Avatar />;

  const textContent = () => {
    if (user.firstName && user.lastName) {
      return user.firstName[0] + user.lastName[0];
    } else if (user.firstName) {
      return user.firstName.substring(0, 2);
    } else if (user.lastName) {
      return user.lastName.substring(0, 2);
    } else if (user.primaryEmail) {
      return user.primaryEmail.substring(0, 2);
    } else {
      return null;
    }
  };

  if (showXP) {
    return (
      <AvatarWithProgressAndLevel
        imageUrl={user.imageUrl ?? undefined}
        progress={userXPData?.normalizedProgress ?? 0}
        level={userXPData?.currentLevel ?? 1}
        textContent={textContent}
        {...rest}
      />
    );
  } else {
    return (
      <Avatar
        variant="solid"
        src={user.imageUrl ?? undefined}
        sx={NEUTRAL_USER_AVATAR_SX}
        {...rest}
      >
        {textContent()?.toUpperCase()}
      </Avatar>
    );
  }
}
