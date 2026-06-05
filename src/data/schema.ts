export type QuestType = 'main' | 'shrine' | 'side';
export type QuestMode = 'checklist' | 'streak' | 'weekly';
export type RecurType = 'weekly' | 'daily';

export interface Objective {
  id: string;
  text: string;
  done: boolean;
  recurring?: RecurType | null;
  target?: number;
  count?: number;
  period?: string;
  bestPeriod?: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  region: string;
  giver: string;
  deadline: string;
  lore: string;
  active: boolean;
  done: boolean;
  mode: QuestMode;
  objectives: Objective[];
  // daily streak
  targetDays: number;
  dailyAction: string;
  streakCount: number;
  bestStreak: number;
  lastCheckIn: string;
  // weekly streak
  timesPerWeek: number;
  weeksTarget: number;
  checkIns: string[];
}

export interface StreakData {
  streak: number;
  lastActiveDate: string;
  prevStreak: number;
  prevActiveDate: string;
  posCount: number;
  countDate: string;
  checkInDate: string;
}

export interface RegionDef {
  color: string;
}

export const REGIONS: Record<string, RegionDef> = {
  Career:  { color: 'var(--cat-career)' },
  Wealth:  { color: 'var(--cat-coin)' },
  Fitness: { color: 'var(--cat-fitness)' },
  Music:   { color: 'var(--cat-music)' },
  Mind:    { color: 'var(--cat-mind)' },
  Craft:   { color: 'var(--cat-craft)' },
};

export interface AppSettings {
  themeFollowsTab: boolean;
  theme: string;
  headingFont: string;
  showStreak: boolean;
  showHints: boolean;
  celebration: boolean;
  sfx: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeFollowsTab: true,
  theme: 'amber',
  headingFont: 'Cormorant Garamond',
  showStreak: true,
  showHints: true,
  celebration: true,
  sfx: true,
};
