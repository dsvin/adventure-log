import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar } from './components/StatusBar';
import { TabRail } from './components/TabRail';
import { QuestList } from './components/QuestList';
import { DetailPanel, Celebrate } from './components/DetailPanel';
import { QuestModal, ConfirmDelete } from './components/QuestModal';
import { REGIONS, DEFAULT_SETTINGS } from './data/schema';
import type { Quest, StreakData, AppSettings } from './data/schema';
import { loadState, saveState } from './data/store';
import { todayStr, daysBetween, weeklyStatus, objPeriodKey, makeQuest } from './data/helpers';
import { SFX } from './sounds/sfx';
import './styles/global.css';

const TAB_THEME: Record<string, string> = { main: 'amber', shrine: 'cyan', side: 'ember' };
const TABS = ['main', 'shrine', 'side'];

function makeInitialStreak(): StreakData {
  return { streak: 0, lastActiveDate: '', prevStreak: 0, prevActiveDate: '', posCount: 0, countDate: '', checkInDate: '' };
}

export default function App() {
  const persisted = useMemo(() => loadState(), []);
  const [quests, setQuests] = useState<Quest[]>(() => persisted?.quests || []);
  const [tab, setTab] = useState<string>(() => persisted?.tab || 'main');
  const [selected, setSelected] = useState<string | null>(() => persisted?.selected || null);
  const [streak, setStreak] = useState<StreakData>(() => persisted?.streakData || makeInitialStreak());
  const [settings, setSettings] = useState<AppSettings>(() => ({ ...DEFAULT_SETTINGS, ...persisted?.settings }));

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; quest: Quest } | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<Quest | null>(null);
  const [celebrate, setCelebrate] = useState<Quest | null>(null);

  const maxStreak = 10;

  // ---- global daily streak logic ----
  const applyActivity = (kind: 'task' | 'checkin', delta: number) => setStreak(prev => {
    const today = todayStr();
    let { streak, lastActiveDate, prevStreak, prevActiveDate, posCount, countDate, checkInDate } = prev;
    if (countDate !== today) { countDate = today; posCount = 0; }
    const wasActive = posCount > 0 || checkInDate === today;
    if (kind === 'task') posCount = Math.max(0, posCount + delta);
    if (kind === 'checkin') checkInDate = today;
    const isActive = posCount > 0 || checkInDate === today;
    if (!wasActive && isActive) {
      prevStreak = streak; prevActiveDate = lastActiveDate;
      const gap = lastActiveDate ? daysBetween(lastActiveDate, today) : null;
      streak = (gap === 1) ? streak + 1 : 1;
      lastActiveDate = today;
    } else if (wasActive && !isActive) {
      streak = prevStreak; lastActiveDate = prevActiveDate;
    }
    return { streak, lastActiveDate, prevStreak, prevActiveDate, posCount, countDate, checkInDate };
  });

  const displayStreak = (() => {
    if (!streak.lastActiveDate) return 0;
    const gap = daysBetween(streak.lastActiveDate, todayStr());
    return gap >= 2 ? 0 : streak.streak;
  })();

  // ---- persist on every change ----
  useEffect(() => {
    saveState({ quests, tab, selected, streakData: streak, settings });
  }, [quests, tab, selected, streak, settings]);

  // ---- theme ----
  const themeSource = modal ? (modalType || modal.quest.type) : tab;
  const activeTheme = settings.themeFollowsTab ? (TAB_THEME[themeSource] || 'amber') : settings.theme;
  useEffect(() => {
    const f = document.getElementById('frame');
    if (f) f.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // ---- sounds ----
  useEffect(() => { SFX.setEnabled(settings.sfx); }, [settings.sfx]);

  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = frameRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      if (!settings.sfx) return;
      const tgt = e.target as Element;
      if (tgt.closest('.tab')) return SFX.move();
      if (tgt.closest('.quest-row')) return SFX.select();
      const obj = tgt.closest('.objective:not(.habit)');
      if (obj) return obj.classList.contains('checked') ? SFX.checkSoft() : SFX.check();
      const hs = tgt.closest('.habit-step');
      if (hs) return hs.classList.contains('add') ? SFX.check() : SFX.checkSoft();
      const cb = tgt.closest('.complete-btn');
      if (cb) { if (!(cb as HTMLButtonElement).disabled) SFX.confirm(); return; }
      if (tgt.closest('.btn-ghost, .icon-btn[title="Delete quest"]')) return SFX.back();
      if (tgt.closest('button, .fmt-opt, .type-opt')) return SFX.click();
    };
    root.addEventListener('click', onClick as EventListener, true);
    return () => root.removeEventListener('click', onClick as EventListener, true);
  }, [settings.sfx]);

  useEffect(() => { if (celebrate && settings.sfx) SFX.complete(); }, [celebrate]);

  // ---- visible quests for active tab ----
  const visible = useMemo(() => {
    const list = quests.filter(q => q.type === tab);
    return [...list.filter(q => !q.done), ...list.filter(q => q.done)];
  }, [quests, tab]);

  useEffect(() => {
    if (!visible.find(q => q.id === selected)) setSelected(visible[0]?.id || null);
  }, [tab, visible.length]);

  const current = quests.find(q => q.id === selected) || null;
  const totalCleared = quests.filter(q => q.done).length;

  // ---- actions ----
  const toggleObj = (qid: string, oid: string) => {
    const q = quests.find(x => x.id === qid);
    const o = q?.objectives.find(x => x.id === oid);
    const willComplete = o ? !o.done : false;
    setQuests(qs => qs.map(q2 => q2.id === qid
      ? { ...q2, objectives: q2.objectives.map(o2 => o2.id === oid ? { ...o2, done: !o2.done } : o2) } : q2));
    applyActivity('task', willComplete ? 1 : -1);
  };

  const logObjective = (qid: string, oid: string, delta = 1) => {
    setQuests(qs => qs.map(q => {
      if (q.id !== qid) return q;
      return { ...q, objectives: q.objectives.map(o => {
        if (o.id !== oid || !o.recurring) return o;
        const key = objPeriodKey(o);
        let count = (o.period === key) ? (o.count || 0) : 0;
        count = Math.max(0, count + delta);
        return { ...o, count, period: key, bestPeriod: Math.max(o.bestPeriod || 0, count) };
      }) };
    }));
    applyActivity('task', delta > 0 ? 1 : -1);
  };

  const completeQuest = (qid: string) => {
    setQuests(qs => qs.map(q => q.id === qid
      ? { ...q, done: true, active: false, objectives: q.objectives.map(o => ({ ...o, done: true })) } : q));
    const q = quests.find(x => x.id === qid);
    if (settings.celebration && q) setCelebrate(q);
  };

  const checkIn = (qid: string) => {
    const today = todayStr();
    const cq = quests.find(x => x.id === qid);
    const alreadyToday = cq && (cq.mode === 'weekly'
      ? (cq.checkIns || []).includes(today)
      : cq.lastCheckIn === today);
    let reachedQuest: Quest | null = null;

    setQuests(qs => qs.map(q => {
      if (q.id !== qid) return q;
      if (q.mode === 'weekly') {
        if ((q.checkIns || []).includes(today)) return q;
        const checkIns = [...(q.checkIns || []), today];
        const ws = weeklyStatus({ ...q, checkIns });
        const reached = ws.streak >= (q.weeksTarget || 8);
        if (reached) reachedQuest = { ...q, checkIns };
        return { ...q, checkIns, done: reached || q.done, active: reached ? false : q.active };
      }
      if (q.lastCheckIn === today) return q;
      const gap = q.lastCheckIn ? daysBetween(q.lastCheckIn, today) : null;
      const newCount = gap === 1 ? q.streakCount + 1 : 1;
      const best = Math.max(q.bestStreak || 0, newCount);
      const reached = newCount >= (q.targetDays || 30);
      if (reached) reachedQuest = { ...q, streakCount: newCount };
      return { ...q, streakCount: newCount, bestStreak: best, lastCheckIn: today,
               done: reached || q.done, active: reached ? false : q.active };
    }));

    if (reachedQuest && settings.celebration) setCelebrate(reachedQuest);
    if (!alreadyToday) applyActivity('checkin', 1);
  };

  const saveQuest = (data: Quest) => {
    setQuests(qs => {
      const exists = qs.find(q => q.id === data.id);
      if (exists) return qs.map(q => q.id === data.id ? { ...q, ...data } : q);
      return [data, ...qs];
    });
    setTab(data.type);
    setSelected(data.id);
    setModal(null);
  };

  const toggleActive = (qid: string) => {
    const q = quests.find(x => x.id === qid);
    if (!q || q.done) return;
    const willBeActive = !q.active;
    setQuests(qs => qs.map(q2 => {
      if (q2.done) return q2;
      if (q2.id === qid) return { ...q2, active: willBeActive };
      return { ...q2, active: false };
    }));
    if (willBeActive && settings.sfx) SFX.setActive();
  };

  const deleteQuest = (qid: string) => {
    setQuests(qs => qs.filter(q => q.id !== qid));
    setConfirmDel(null);
    if (selected === qid) setSelected(null);
  };

  const openCreate = () => {
    const q = makeQuest({ type: tab as Quest['type'] });
    setModalType(q.type);
    setModal({ mode: 'create', quest: q });
  };
  const openEdit = () => {
    if (current) { setModalType(current.type); setModal({ mode: 'edit', quest: current }); }
  };

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as Element).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (modal || confirmDel || celebrate) {
        if (e.key === 'Escape') { setModal(null); setConfirmDel(null); setCelebrate(null); }
        return;
      }
      if (e.key === 'n' || e.key === 'N') openCreate();
      if (e.key === 'Enter' && current && !current.done) toggleActive(current.id);
      const i = TABS.indexOf(tab);
      if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % 3]);
      if (e.key === 'ArrowLeft')  setTab(TABS[(i + 2) % 3]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [modal, confirmDel, celebrate, tab, current]);

  // ---- splash is dismissed by the splash animation JS (not by React) ----
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (!splash) { document.getElementById('root')?.classList.add('ready'); }
  }, []);

  // ---- canvas scaling ----
  useEffect(() => {
    const fit = () => {
      const frame = document.getElementById('frame');
      if (!frame) return;
      // Fit the canvas — no clipping, no content cut off
      // Side/top bars are invisible because #root bg matches the app theme
      const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
      frame.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);
    [60, 200, 600].forEach(d => setTimeout(fit, d));
    const ro = new ResizeObserver(fit);
    ro.observe(document.documentElement);
    return () => { window.removeEventListener('resize', fit); ro.disconnect(); };
  }, []);

  const setSetting = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setSettings(s => ({ ...s, [k]: v }));

  return (
    <div id="frame" data-theme={activeTheme}>
      <div className="backdrop">
        <svg className="watermark" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.8">
          <path d="M60 6 L78 42 L114 60 L78 78 L60 114 L42 78 L6 60 L42 42 Z" />
          <path d="M60 24 L72 48 L96 60 L72 72 L60 96 L48 72 L24 60 L48 48 Z" />
          <circle cx="60" cy="60" r="9" /><circle cx="60" cy="60" r="40" opacity="0.5" />
        </svg>
      </div>
      <div className="vignette"></div>

      <div className="app" ref={frameRef}>
        <StatusBar
          streak={settings.showStreak ? displayStreak : 0}
          maxStreak={settings.showStreak ? maxStreak : 0}
          cleared={totalCleared}
          total={quests.length}
        />

        <TabRail active={tab} onChange={setTab} />

        <div className="main">
          <QuestList quests={visible} selectedId={selected} onSelect={setSelected}
                     onNew={openCreate} regions={REGIONS}
                     onToggleActive={(id) => toggleActive(id)} />
          <DetailPanel
            quest={current} region={current ? REGIONS[current.region] : undefined}
            onToggleObj={(oid) => current && toggleObj(current.id, oid)}
            onLogObj={(oid, delta) => current && logObjective(current.id, oid, delta)}
            onComplete={() => current && completeQuest(current.id)}
            onCheckIn={() => current && checkIn(current.id)}
            onEdit={openEdit}
            onDelete={() => current && setConfirmDel(current)}
            onToggleActive={() => current && toggleActive(current.id)}
          />
        </div>

        {settings.showHints && (
          <div className="hints">
            <span className="hint"><span className="key">←→</span> Switch log</span>
            <span className="hint"><span className="key">N</span> New quest</span>
            <span className="hint"><span className="key">↵</span> Set active</span>
          </div>
        )}

        {modal && (
          <QuestModal initial={modal.quest} onTypeChange={setModalType}
                      onSave={saveQuest} onCancel={() => setModal(null)} />
        )}
        {confirmDel && (
          <ConfirmDelete quest={confirmDel}
                         onConfirm={() => deleteQuest(confirmDel.id)} onCancel={() => setConfirmDel(null)} />
        )}
        {celebrate && <Celebrate quest={celebrate} onDone={() => setCelebrate(null)} />}

        {/* Settings panel — bottom left corner */}
        <details className="settings-panel">
          <summary className="settings-toggle" title="Settings">⚙</summary>
          <div className="settings-body">
            <div className="settings-row">
              <label>Theme follows tab</label>
              <input type="checkbox" checked={settings.themeFollowsTab} onChange={e => setSetting('themeFollowsTab', e.target.checked)} />
            </div>
            {!settings.themeFollowsTab && (
              <div className="settings-row">
                <label>Theme</label>
                <select value={settings.theme} onChange={e => setSetting('theme', e.target.value)}>
                  {['amber','cyan','ember'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="settings-row">
              <label>Streak meter</label>
              <input type="checkbox" checked={settings.showStreak} onChange={e => setSetting('showStreak', e.target.checked)} />
            </div>
            <div className="settings-row">
              <label>Control hints</label>
              <input type="checkbox" checked={settings.showHints} onChange={e => setSetting('showHints', e.target.checked)} />
            </div>
            <div className="settings-row">
              <label>Celebrations</label>
              <input type="checkbox" checked={settings.celebration} onChange={e => setSetting('celebration', e.target.checked)} />
            </div>
            <div className="settings-row">
              <label>Sound effects</label>
              <input type="checkbox" checked={settings.sfx} onChange={e => {
                setSetting('sfx', e.target.checked);
                if (e.target.checked) { SFX.resume(); SFX.setEnabled(true); SFX.move(); }
              }} />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
