import { LinearProgress, Typography } from "@mui/joy";
import { useCountUp } from "use-count-up";
import type { UserXP } from "../../lib/api/gamification";
import { LEVEL_NAMES } from "../../../packages/apiTypes/src/academy/calcLevelProgress";

import { useTranslation } from "react-i18next";

/* dynamic translation keys
t("academyLevels.beginner")
t("academyLevels.novice")
t("academyLevels.prompt architect")
t("academyLevels.ai_pioneer")
t("academyLevels.ai_allstar")
t("academyLevels.ai_visionary")
t("academyLevels.ai_innovator")
t("academyLevels.ai_expert")
t("academyLevels.ai_master")
t("academyLevels.ai_mentor")
*/

export const XPBar = ({
  userXPData,
  small = true,
}: {
  userXPData: UserXP;
  small?: boolean;
}) => {
  const titleSize = small ? "body-lg" : "h4";
  const textSize = small ? "body-xs" : "body-lg";
  const container = small ? "w-[450px]" : "w-[650px] p-4";
  const { t } = useTranslation();

  const { value } = useCountUp({
    isCounting: true,
    duration: 1,
    easing: "easeOutCubic",
    start: userXPData.normalizedProgressBefore,
    end: userXPData.normalizedProgress,
  });

  return (
    <div className={container}>
      <div className="flex flex-row justify-between gap-2">
        <Typography level={textSize}>
          Level {userXPData.currentLevel}
        </Typography>
        <Typography level={textSize}>
          {userXPData.xp} {t("aiKnowledgePoints")}
        </Typography>
      </div>
      <div className="flex flex-row items-start">
        <Typography level={titleSize}>
          {t(
            "academyLevels." +
              LEVEL_NAMES[
                Math.min(userXPData.currentLevel - 1, LEVEL_NAMES.length - 1)
              ],
          )}
        </Typography>
      </div>
      <div className="py-4">
        <LinearProgress determinate value={Number(value!)} />
      </div>
      <div className="flex flex-row items-end">
        <Typography level={textSize}>
          {userXPData.currentLevelProgress} /{" "}
          {userXPData.currentLevelProgress + userXPData.xpNeededForNextLevel}{" "}
          {t("pointsToNextLevel")}
        </Typography>
      </div>
    </div>
  );
};
