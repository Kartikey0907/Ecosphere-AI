import type { UserLevel } from '@/types';

// ─── XP & Level System ─────────────────────────────────────

export const LEVELS: { level: number; name: UserLevel; minXp: number; maxXp: number }[] = [
  { level: 1, name: 'Seedling', minXp: 0, maxXp: 100 },
  { level: 2, name: 'Seedling', minXp: 100, maxXp: 250 },
  { level: 3, name: 'Seedling', minXp: 250, maxXp: 500 },
  { level: 4, name: 'Green Explorer', minXp: 500, maxXp: 850 },
  { level: 5, name: 'Green Explorer', minXp: 850, maxXp: 1300 },
  { level: 6, name: 'Green Explorer', minXp: 1300, maxXp: 1900 },
  { level: 7, name: 'Eco Warrior', minXp: 1900, maxXp: 2700 },
  { level: 8, name: 'Eco Warrior', minXp: 2700, maxXp: 3800 },
  { level: 9, name: 'Eco Warrior', minXp: 3800, maxXp: 5200 },
  { level: 10, name: 'Forest Guardian', minXp: 5200, maxXp: 7000 },
  { level: 11, name: 'Forest Guardian', minXp: 7000, maxXp: 9200 },
  { level: 12, name: 'Forest Guardian', minXp: 9200, maxXp: 12000 },
  { level: 13, name: 'Climate Champion', minXp: 12000, maxXp: 15500 },
  { level: 14, name: 'Climate Champion', minXp: 15500, maxXp: 20000 },
  { level: 15, name: 'Climate Champion', minXp: 20000, maxXp: 26000 },
  { level: 16, name: 'Earth Protector', minXp: 26000, maxXp: 34000 },
  { level: 17, name: 'Earth Protector', minXp: 34000, maxXp: 44000 },
  { level: 18, name: 'Earth Protector', minXp: 44000, maxXp: 56000 },
  { level: 19, name: 'Earth Protector', minXp: 56000, maxXp: 70000 },
  { level: 20, name: 'Earth Protector', minXp: 70000, maxXp: 999999 },
];

// ─── XP Rewards ─────────────────────────────────────────────

export const XP_REWARDS = {
  dailyLog: 25,             // Logging daily activities
  streakBonus: 10,          // Per day in streak (multiplier)
  goalProgress: 15,         // Progress towards a goal
  goalComplete: 100,        // Completing a goal
  challengeComplete: 50,    // Completing a challenge (base, + challenge.xpReward)
  achievementUnlock: 75,    // Unlocking an achievement
  greenTransport: 10,       // Using bike/walk
  veganMeal: 5,             // Eating vegan
  recycling: 5,             // Recycling items
  composting: 10,           // Composting
  underAvgCarbon: 20,       // Below average daily carbon
  perfectDay: 50,           // All green choices in a day
} as const;

/**
 * Get level info from XP amount
 */
export function getLevelFromXp(xp: number): {
  level: number;
  name: UserLevel;
  currentXp: number;
  xpForNextLevel: number;
  progress: number;
} {
  const levelData = LEVELS.find(l => xp >= l.minXp && xp < l.maxXp) || LEVELS[LEVELS.length - 1];
  const currentXp = xp - levelData.minXp;
  const xpForNextLevel = levelData.maxXp - levelData.minXp;
  const progress = Math.min(1, currentXp / xpForNextLevel);

  return {
    level: levelData.level,
    name: levelData.name,
    currentXp,
    xpForNextLevel,
    progress,
  };
}

/**
 * Calculate XP earned from a daily log
 */
export function calculateLogXp(log: {
  bikeKm?: number;
  walkKm?: number;
  veganMeals?: number;
  recycledItems?: number;
  compostedKg?: number;
  carbonFootprint: number;
}, streak: number): { totalXp: number; breakdown: { reason: string; xp: number }[] } {
  const breakdown: { reason: string; xp: number }[] = [];

  // Base XP for logging
  breakdown.push({ reason: 'Daily log completed', xp: XP_REWARDS.dailyLog });

  // Streak bonus
  if (streak > 1) {
    const streakXp = Math.min(streak * XP_REWARDS.streakBonus, 100);
    breakdown.push({ reason: `${streak}-day streak bonus`, xp: streakXp });
  }

  // Green transport
  if ((log.bikeKm || 0) > 0 || (log.walkKm || 0) > 0) {
    breakdown.push({ reason: 'Green transport used', xp: XP_REWARDS.greenTransport });
  }

  // Vegan meals
  const veganMeals = log.veganMeals || 0;
  if (veganMeals > 0) {
    breakdown.push({ reason: `${veganMeals} vegan meal(s)`, xp: veganMeals * XP_REWARDS.veganMeal });
  }

  // Recycling
  const recycled = log.recycledItems || 0;
  if (recycled > 0) {
    breakdown.push({ reason: `Recycled ${recycled} item(s)`, xp: recycled * XP_REWARDS.recycling });
  }

  // Composting
  if ((log.compostedKg || 0) > 0) {
    breakdown.push({ reason: 'Composting done', xp: XP_REWARDS.composting });
  }

  // Under average carbon
  if (log.carbonFootprint < 10) {
    breakdown.push({ reason: 'Below average carbon footprint!', xp: XP_REWARDS.underAvgCarbon });
  }

  const totalXp = breakdown.reduce((sum, item) => sum + item.xp, 0);

  return { totalXp, breakdown };
}

/**
 * Get level color for badges
 */
export function getLevelColor(levelName: UserLevel): string {
  switch (levelName) {
    case 'Seedling': return '#86efac';
    case 'Green Explorer': return '#34d399';
    case 'Eco Warrior': return '#10b981';
    case 'Forest Guardian': return '#059669';
    case 'Climate Champion': return '#047857';
    case 'Earth Protector': return '#065f46';
    default: return '#10b981';
  }
}
