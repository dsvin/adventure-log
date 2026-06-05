import type { Quest, StreakData, AppSettings } from './schema';

const KEY = 'adventure-log-v1';

export interface PersistedState {
  quests: Quest[];
  tab: string;
  selected: string | null;
  streakData: StreakData;
  settings: AppSettings;
}

const CURRENT_VERSION = 2; // bump this to wipe old seed data

export function loadState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If saved data is from an older version (had seed quests), discard it
      if (!parsed._version || parsed._version < CURRENT_VERSION) {
        localStorage.removeItem(KEY);
        return null;
      }
      return parsed;
    }
  } catch {}
  return null;
}

export function saveState(state: PersistedState): void {
  try { localStorage.setItem(KEY, JSON.stringify({ ...state, _version: CURRENT_VERSION })); } catch {}
}
