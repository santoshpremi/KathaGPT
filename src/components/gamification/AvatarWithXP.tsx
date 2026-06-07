import { Avatar, CircularProgress, Typography } from "@mui/joy";
import type { ComponentProps } from "react";
import { NEUTRAL_USER_AVATAR_SX } from "../../shared/constants/avatars";
export const AvatarWithProgressAndLevel = ({
  imageUrl,
  progress,
  level,
  textContent,
  ...rest
}: {
  imageUrl: string | undefined;
  progress: number;
  level: number;
  textContent: () => string | null;
} & ComponentProps<typeof Avatar>) => {
  return (
    <div className="relative p-1">
      <Avatar variant="solid" src={imageUrl} sx={NEUTRAL_USER_AVATAR_SX} {...rest}>
        {textContent()?.toUpperCase()}
      </Avatar>
      <div className="z-1 absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <CircularProgress
          determinate
          value={progress}
          variant="solid"
          thickness={4}
          color="neutral"
          sx={{ "--CircularProgress-size": "56px" }}
        />
        <div className="absolute bottom-0 right-0 flex h-4 w-4 translate-x-1.5 translate-y-1.5 items-center justify-center rounded-full bg-white">
          <div className="font-bold text-black">
            <Typography level="body-sm">{level}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
