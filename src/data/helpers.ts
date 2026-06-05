import type { Quest, Objective } from './schema';

export function iso(d: Date): string {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function todayStr(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0); return iso(d);
}

export function daysBetween(aStr: string, bStr: string): number {
  const a = new Date(aStr + 'T00:00:00'), b = new Date(bStr + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function weekStartStr(dStr: string): string {
  const d = new Date(dStr + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return iso(d);
}

export function addDaysStr(dStr: string, n: number): string {
  const d = new Date(dStr + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d);
}

export function prevWeekStr(wStr: string): string { return addDaysStr(wStr, -7); }

export interface StreakStatus {
  current: number;
  checkedToday: boolean;
  atRisk: boolean;
  broken: boolean;
  fresh?: boolean;
  brokenFrom?: number;
}

export function streakStatus(q: Quest): StreakStatus {
  const today = todayStr();
  if (!q.lastCheckIn) return { current: 0, checkedToday: false, atRisk: false, broken: false, fresh: true };
  const gap = daysBetween(q.lastCheckIn, today);
  if (gap <= 0) return { current: q.streakCount, checkedToday: true, atRisk: false, broken: false };
  if (gap === 1) return { current: q.streakCount, checkedToday: false, atRisk: true, broken: false };
  return { current: 0, checkedToday: false, atRisk: false, broken: true, brokenFrom: q.streakCount };
}

export interface WeekDay {
  date: string;
  done: boolean;
  isToday: boolean;
  future: boolean;
}

export interface WeeklyStatus {
  target: number;
  weeksTarget: number;
  thisWeekCount: number;
  weekMet: boolean;
  checkedToday: boolean;
  days: WeekDay[];
  streak: number;
  best: number;
  atRisk: boolean;
  fresh: boolean;
}

export function weeklyStatus(q: Quest): WeeklyStatus {
  const target = q.timesPerWeek || 3;
  const weeksTarget = q.weeksTarget || 8;
  const today = todayStr();
  const thisWeek = weekStartStr(today);
  const ins = q.checkIns || [];
  const byWeek: Record<string, number> = {};
  ins.forEach(d => { const k = weekStartStr(d); byWeek[k] = (byWeek[k] || 0) + 1; });
  const thisWeekCount = byWeek[thisWeek] || 0;
  const weekMet = thisWeekCount >= target;
  const checkedToday = ins.includes(today);
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const dStr = addDaysStr(thisWeek, i);
    return { date: dStr, done: ins.includes(dStr), isToday: dStr === today, future: daysBetween(dStr, today) < 0 };
  });
  let streak = 0;
  let cursor = weekMet ? thisWeek : prevWeekStr(thisWeek);
  while ((byWeek[cursor] || 0) >= target) { streak++; cursor = prevWeekStr(cursor); }
  let best = 0, run = 0;
  const keys = Object.keys(byWeek);
  if (keys.length) {
    let c = keys.sort()[0];
    while (daysBetween(c, thisWeek) >= 0) {
      if ((byWeek[c] || 0) >= target) { run++; if (run > best) best = run; }
      else if (c !== thisWeek) { run = 0; }
      c = addDaysStr(c, 7);
    }
  }
  if (streak > best) best = streak;
  return { target, weeksTarget, thisWeekCount, weekMet, checkedToday, days, streak, best,
           atRisk: !weekMet && thisWeekCount > 0, fresh: ins.length === 0 };
}

export function objPeriodKey(o: Objective): string {
  const today = todayStr();
  return o.recurring === 'daily' ? today : weekStartStr(today);
}

export interface HabitStatus {
  cadence: string;
  target: number;
  progress: number;
  met: boolean;
  key: string;
  best: number;
}

export function objHabit(o: Objective): HabitStatus {
  const key = objPeriodKey(o);
  const progress = (o.period === key) ? (o.count || 0) : 0;
  const target = o.target || 1;
  return { cadence: o.recurring!, target, progress, met: progress >= target, key,
           best: Math.max(o.bestPeriod || 0, progress) };
}

let _id = 100;
export function uid(): string { return 'q' + (++_id); }

export function makeQuest(partial: Partial<Quest> = {}): Quest {
  return {
    id: uid(), type: 'side', title: '', region: 'Career', giver: 'You',
    deadline: '', lore: '', objectives: [], done: false, active: false,
    mode: 'checklist',
    targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [],
    ...partial,
  };
}

export function fmtDeadline(d: string) {
  if (!d) return null;
  const date = new Date(d + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((date.getTime() - now.getTime()) / 86400000);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let rel = '';
  if (days < 0) rel = 'overdue';
  else if (days === 0) rel = 'today';
  else if (days <= 30) rel = `${days}d left`;
  else if (days < 365) rel = `${Math.round(days / 30)}mo left`;
  else rel = `${(days / 365).toFixed(1)}y left`;
  return { label, rel, soon: days >= 0 && days <= 30, year: date.getFullYear() };
}
