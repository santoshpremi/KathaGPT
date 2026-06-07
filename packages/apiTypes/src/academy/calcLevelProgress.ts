// Thresholds required to reach the next level
// E.g. you need XP_THRESHOLDS[0] xp to go from level 1 to level 2
export const XP_THRESHOLDS = [
  10, 50, 40, 100, 200, 200, 200, 200, 200, 200,
] as const;

export const LEVEL_NAMES = [
  "beginner",
  "novice",
  "prompt architect",
  "ai_pioneer",
  "ai_allstar",
  "ai_visionary",
  "ai_innovator",
  "ai_expert",
  "ai_master",
  "ai_mentor",
] as const;

function determineLevel(xp: number): number {
  let level = 1;
  while ((xp -= getDeltaXpNeededForLevel(level + 1)) >= 0) {
    level++;
  }
  return level;
}

function getDeltaXpNeededForLevel(level: number): number {
  if (level <= 1) return 0;
  return level - 2 < XP_THRESHOLDS.length ? XP_THRESHOLDS[level - 2]! : 200;
}

function getTotalXpNeededToReachLevel(level: number) {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getDeltaXpNeededForLevel(i);
  }
  return totalXP;
}

/**
 * Calculate the current level, progress to the next level, and xp needed for the next level
 * For levels beyond the thresholds, every 200 XP is a new level
 * @param xp: a user's xp
 */
export function calcLevelProgress(xp: number): {
  currentLevel: number;
  currentLevelProgress: number;
  xpNeededForNextLevel: number;
  totalXP: number;
} {
  const currentLevel = determineLevel(xp);
  const xpForCurrentLevel = getTotalXpNeededToReachLevel(currentLevel);
  const currentLevelProgress = xp - xpForCurrentLevel;
  const xpNeededForNextLevel =
    getDeltaXpNeededForLevel(currentLevel + 1) - currentLevelProgress;
  return {
    currentLevel,
    currentLevelProgress: currentLevelProgress,
    xpNeededForNextLevel,
    totalXP: xp,
  };
}

// Range of 0 to 100
export function normalizeCurrentProgress(
  currentLevelProgress: number,
  level: number,
): number {
  const progress =
    (currentLevelProgress / getDeltaXpNeededForLevel(level + 1)) * 100;
  return Math.floor(Math.min(100, progress));
}
