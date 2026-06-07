import { Typography } from "@mui/joy";
import { useUser } from "../../../lib/api/user";
import { type UserXP } from "../../../lib/api/gamification";
import { useOrganization } from "../../../lib/api/organization";
import { UserAvatar } from "./UserAvatar";
import { useParams } from "../../../router";

export function UserDisplay({
  userId,
  isAcademy,
  userXPData,
  isAvatarOnly,
}: {
  userId?: string;
  userXPData?: UserXP;
  isAcademy?: boolean;
  isAvatarOnly?: boolean;
}) {
  const me = useUser(userId ?? "me");
  const { organizationId } = useParams("/:organizationId");
  const organization = useOrganization({ skip: organizationId ? false : true });
  return (
    <div className="flex flex-row items-center gap-3">
      <UserAvatar showXP={isAcademy} userXPData={userXPData} />

      {!isAvatarOnly && (
        <div className="flex flex-col items-start">
          <Typography level="title-sm" sx={{ whiteSpace: "nowrap" }}>
            {me?.firstName} {me?.lastName}
          </Typography>
          {organization && (
            <Typography level="body-xs" sx={{ whiteSpace: "nowrap" }}>
              @ {organization.name}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
