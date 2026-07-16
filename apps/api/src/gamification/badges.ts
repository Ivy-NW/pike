export interface BadgeStats {
  totalCompleted: number;
  currentStreak: number;
}

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  check: (stats: BadgeStats) => boolean;
}

/**
 * Phase 2 — FR-2 "earned badges." A small, fixed starter set; criteria are evaluated
 * against total completed redemptions (any repeat visit counts, not just distinct quests —
 * repeat visits are exactly the engagement PIKE wants to reward) and the current streak.
 * Add new badges here; UserBadge rows are created lazily the first time a check passes.
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: "first_quest",
    name: "First Steps",
    description: "Complete your first quest",
    check: (s) => s.totalCompleted >= 1,
  },
  {
    key: "five_quests",
    name: "Explorer",
    description: "Complete 5 quests",
    check: (s) => s.totalCompleted >= 5,
  },
  {
    key: "ten_quests",
    name: "Adventurer",
    description: "Complete 10 quests",
    check: (s) => s.totalCompleted >= 10,
  },
  {
    key: "three_day_streak",
    name: "On a Roll",
    description: "Reach a 3-day streak",
    check: (s) => s.currentStreak >= 3,
  },
  {
    key: "seven_day_streak",
    name: "Dedicated",
    description: "Reach a 7-day streak",
    check: (s) => s.currentStreak >= 7,
  },
];
