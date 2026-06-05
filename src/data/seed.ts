import type { Quest, Objective } from './schema';
import { uid, addDaysStr, todayStr, weekStartStr } from './helpers';

function obj(text: string, done = false): Objective {
  return { id: 'o' + uid(), text, done };
}

function habitObj(text: string, cadence: 'weekly' | 'daily', target: number, count = 0): Objective {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (cadence === 'weekly') { const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); }
  const z = (n: number) => String(n).padStart(2, '0');
  const period = count ? `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}` : '';
  return { id: 'o' + uid(), text, done: false, recurring: cadence, target, count, period, bestPeriod: count };
}

function seedOffset(days: number): string { return addDaysStr(todayStr(), days); }

function weeklySeed(perWeek: number, weeks: number, thisWeek: number): string[] {
  const out: string[] = [];
  for (let w = 1; w <= weeks; w++) for (let d = 0; d < perWeek; d++) out.push(seedOffset(-(w * 7) + d));
  for (let d = 1; d <= thisWeek; d++) out.push(seedOffset(-d));
  return out;
}

export const SEED: Quest[] = [
  // MAIN QUESTS
  {
    id: uid(), type: 'main', title: 'Land the Dream Role', region: 'Career',
    giver: 'Future Self', active: true, deadline: '2026-12-31',
    lore: "Every great hero needs a purpose. Forge the career you actually want — not the one handed to you. Build the proof, walk into the room, and claim the role that makes the rest of the map worth crossing.",
    objectives: [ obj('Ship 3 portfolio projects', true), habitObj('Reach out to 10 people', 'weekly', 10, 6), obj('Pass a mock interview loop'), obj('Sign the offer') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'main', title: 'Build the First $50k', region: 'Wealth',
    giver: 'Future Self', active: false, deadline: '2027-06-01',
    lore: "Gold is freedom in disguise. Set the foundation — a runway that lets you take the risks the timid never will.",
    objectives: [ obj('Automate monthly savings', true), obj('Open an index-fund account'), obj('Launch one income side-stream'), obj('Cross the $50,000 line') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'main', title: 'Master Your Craft', region: 'Career',
    giver: 'Future Self', active: false, deadline: '2026-09-01',
    lore: "Become undeniably good at the one thing you care most about. Skill is the sword you carry into every other quest.",
    objectives: [ obj('Define the skill to master'), obj('Practice 100 deliberate hours'), obj('Get feedback from a mentor'), obj('Teach it to someone else') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'main', title: 'Graduate With Honors', region: 'Mind',
    giver: 'Future Self', active: false, deadline: '2025-05-20',
    lore: "The first great trial — completed. The plateau is behind you; the open world begins.",
    objectives: [ obj('Finish capstone', true), obj('Hold a 3.7+ GPA', true), obj('Walk the stage', true) ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: true,
  },

  // SHRINE QUESTS
  {
    id: uid(), type: 'shrine', title: 'The 50-Day Stillness', region: 'Mind',
    giver: 'The Monk', active: true, deadline: '',
    lore: "Stillness is a discipline, not a mood. Sit with the quiet every day until focus becomes a place you can return to at will. Miss a day and the chain breaks — begin again, wiser.",
    objectives: [],
    mode: 'streak', targetDays: 50, dailyAction: 'Meditate 10 minutes',
    streakCount: 12, bestStreak: 12, lastCheckIn: seedOffset(-1),
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'The Iron Discipline', region: 'Fitness',
    giver: 'The Coach', active: true, deadline: '',
    lore: "Strength isn't built in a day — it's built in weeks that don't quit. Hit the gym four times a week, every week, until showing up stops being a choice and becomes who you are.",
    objectives: [],
    mode: 'weekly', timesPerWeek: 4, weeksTarget: 8, checkIns: weeklySeed(4, 3, 2),
    targetDays: 30, dailyAction: 'Train at the gym', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'Trial of the Triathlon', region: 'Fitness',
    giver: 'The Coach', active: true, deadline: '2026-08-15',
    lore: "Three disciplines, one body. Swim, ride, and run until the distance stops being the enemy.",
    objectives: [ obj('Swim 1.5km without stopping', true), obj('Cycle a 40km route', true), obj('Run a 10km under target pace'), obj('Complete a brick workout'), obj('Finish a sprint-distance race') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'The Composition in Six Strings', region: 'Music',
    giver: 'The Bard', active: false, deadline: '2026-07-10',
    lore: "A song you've loved for years, waiting to live in your hands. Learn it note for note, then play it like it was always yours.",
    objectives: [ obj('Learn the intro cleanly', true), obj('Memorize the chord progression'), obj('Nail the solo at full tempo'), obj('Play it start to finish for someone') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'Read the Twelve', region: 'Mind',
    giver: 'The Archivist', active: false, deadline: '2026-12-20',
    lore: "Twelve books across the year — worlds and ideas to carry into every other quest.",
    objectives: [ obj('Build the reading list', true), obj('Finish 4 by spring', true), obj('Finish 8 by autumn'), obj('Finish all 12'), obj('Write one reflection each') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'Trial of the Iron Kitchen', region: 'Craft',
    giver: 'The Cook', active: false, deadline: '2026-10-01',
    lore: "Master ten dishes well enough to cook them from memory.",
    objectives: [ obj('Master 3 weeknight staples', true), obj('Bake bread from scratch'), obj('Host a dinner for friends'), obj('Cook 10 dishes without a recipe') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'shrine', title: 'The Silent Statue', region: 'Mind',
    giver: 'The Monk', active: false, deadline: '2025-11-01',
    lore: "Stillness was the trial. You sat with the quiet until it stopped being uncomfortable.",
    objectives: [ obj('Meditate 10 min daily for a month', true), obj('Complete a silent morning', true), obj('Reach a 30-day streak', true) ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: true,
  },

  // SIDE QUESTS
  {
    id: uid(), type: 'side', title: 'Scout the New AI Tools', region: 'Craft',
    giver: 'Curiosity', active: true, deadline: '2026-06-30',
    lore: "Rumor speaks of strange new instruments appearing across the land each week. Try them, judge them, keep the ones worth their weight.",
    objectives: [ obj('Try 3 new tools this month', true), obj('Automate one boring task'), obj('Share findings with a friend') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'side', title: 'Chase the Spark', region: 'Craft',
    giver: 'Curiosity', active: false, deadline: '',
    lore: "Ideas arrive uninvited and leave just as fast. Catch the next one that won't let go.",
    objectives: [ obj('Keep an ideas note'), obj('Pick one to prototype'), obj('Ship a scrappy v0') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'side', title: 'Wander a New Neighborhood', region: 'Mind',
    giver: 'Curiosity', active: false, deadline: '',
    lore: "The map has corners you've never walked. Pick one this weekend, no plan required.",
    objectives: [ obj('Choose a district'), obj('Find one good coffee'), obj('Take a photo worth keeping') ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: false,
  },
  {
    id: uid(), type: 'side', title: "A Friend's Request", region: 'Craft',
    giver: 'Mara', active: false, deadline: '2026-04-12',
    lore: "Mara needed a hand with her portfolio site. You answered the call — small quests build big bonds.",
    objectives: [ obj('Review the design', true), obj('Fix the layout bugs', true), obj('Ship it live', true) ],
    mode: 'checklist', targetDays: 30, dailyAction: '', streakCount: 0, bestStreak: 0, lastCheckIn: '',
    timesPerWeek: 3, weeksTarget: 8, checkIns: [], done: true,
  },
];
