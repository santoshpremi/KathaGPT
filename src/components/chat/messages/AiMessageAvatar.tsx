import { SmartToyOutlined } from "@mui/icons-material";
import { Avatar } from "@mui/joy";
import { NEUTRAL_AI_AVATAR_SX } from "../../../shared/constants/avatars";

export function AiMessageAvatar() {
  return (
    <Avatar variant="soft" sx={NEUTRAL_AI_AVATAR_SX}>
      <SmartToyOutlined sx={{ fontSize: 18 }} />
    </Avatar>
  );
}
