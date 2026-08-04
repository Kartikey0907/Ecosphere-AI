// ─── User & Auth Types ──────────────────────────────────────

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type UserLevel = 
  | 'Seedling'
  | 'Green Explorer'
  | 'Eco Warrior'
  | 'Forest Guardian'
  | 'Climate Champion'
  | 'Earth Protector';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  createdAt: string;
}

// ─── Daily Log Types ────────────────────────────────────────

export interface DailyLogInput {
  date: string;
  carKm?: number;
  busKm?: number;
  trainKm?: number;
  bikeKm?: number;
  walkKm?: number;
  flightKm?: number;
  waterUsage?: number;
  electricityUsage?: number;
  meatMeals?: number;
  vegMeals?: number;
  veganMeals?: number;
  plasticItems?: number;
  recycledItems?: number;
  compostedKg?: number;
  newClothingItems?: number;
  secondHandItems?: number;
}

export interface DailyLogData extends DailyLogInput {
  id: string;
  userId: string;
  carbonFootprint: number;
  createdAt: string;
}

// ─── Sustainability Score ───────────────────────────────────

export interface SustainabilityScoreData {
  id: string;
  userId: string;
  date: string;
  carbonScore: number;
  waterScore: number;
  energyScore: number;
  transportScore: number;
  recyclingScore: number;
  wasteScore: number;
  overallScore: number;
}

// ─── Goals ──────────────────────────────────────────────────

export type GoalCategory = 'CARBON' | 'WATER' | 'ENERGY' | 'TRANSPORT' | 'RECYCLING' | 'WASTE';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';

export interface GoalData {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: GoalStatus;
}

// ─── Challenges ─────────────────────────────────────────────

export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type ChallengeType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  difficulty: ChallengeDifficulty;
  type: ChallengeType;
  targetValue: number;
  unit: string;
  icon: string;
  active: boolean;
  userProgress?: number;
  userCompleted?: boolean;
}

// ─── Achievements ───────────────────────────────────────────

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

// ─── Notifications ──────────────────────────────────────────

export type NotificationType = 'ACHIEVEMENT' | 'CHALLENGE' | 'GOAL' | 'AI_INSIGHT' | 'SYSTEM' | 'SOCIAL';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── AI Insights ────────────────────────────────────────────

export type InsightType = 'TIP' | 'FORECAST' | 'REPORT' | 'RECOMMENDATION' | 'ALERT';
export type InsightImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AiInsightData {
  id: string;
  type: InsightType;
  title: string;
  content: string;
  impact: InsightImpact | null;
  category: string | null;
  dismissed: boolean;
  createdAt: string;
}

// ─── Leaderboard ────────────────────────────────────────────

export interface LeaderboardEntryData {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  level: number;
}

// ─── Dashboard Stats ────────────────────────────────────────

export interface DashboardStats {
  todayCarbon: number;
  weeklyCarbon: number;
  monthlyCarbon: number;
  waterUsage: number;
  electricityUsage: number;
  recyclingRate: number;
  sustainabilityScore: number;
  streak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  levelName: UserLevel;
}

// ─── Chart Data ─────────────────────────────────────────────

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// ─── Navigation ─────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
