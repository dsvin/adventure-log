import React from 'react';
import type { Quest, RegionDef, Objective } from '../data/schema';
import { questIcon, IconSeal, Ico } from '../icons';
import { fmtDeadline, streakStatus, weeklyStatus, objHabit } from '../data/helpers';

function HabitObjective({ o, frozen, onLog }: { o: Objective; frozen: boolean; onLog: (d: number) => void }) {
  const h = objHabit(o);
  const pct = Math.min(100, Math.round((h.progress / h.target) * 100));
  const periodLabel = h.cadence === 'daily' ? 'today' : 'this week';
  return (
    <div className={'objective habit' + (h.met ? ' met' : '')}>
      <span className="habit-mark">{h.met ? '✓' : '↻'}</span>
      <div className="habit-body">
        <div className="habit-top">
          <span className="obj-text">{o.text}</span>
          <span className="habit-count"><b>{h.progress}</b>/{h.target} {periodLabel}</span>
        </div>
        <div className="habit-bar"><div className="habit-fill" style={{ width: pct + '%' }} /></div>
        <div className="habit-meta">{h.cadence === 'daily' ? 'Daily' : 'Weekly'} · best {h.best}/{h.target}</div>
      </div>
      {!frozen && (
        <div className="habit-ctrls">
          <button type="button" className="habit-step" onClick={() => onLog(-1)} disabled={h.progress <= 0}>−</button>
          <button type="button" className="habit-step add" onClick={() => onLog(1)}>+</button>
        </div>
      )}
    </div>
  );
}

function StreakBoard({ quest }: { quest: Quest }) {
  const status = streakStatus(quest);
  const target = quest.targetDays || 30;
  const current = status.current;
  const filled = current;
  const todayIndex = status.checkedToday ? -1 : (status.broken ? 0 : current);
  const showGrid = target <= 120;
  return (
    <>
      <div className="obj-head">Daily Ritual</div>
      <div className="ritual">{quest.dailyAction || quest.title}</div>
      <div className="streak-stat">
        <span className="streak-day">Day <b>{current}</b> of {target}</span>
        <span className="streak-best">Longest: {Math.max(quest.bestStreak || 0, current)} days</span>
      </div>
      {showGrid && (
        <div className="day-grid">
          {Array.from({ length: target }, (_, i) => (
            <span key={i} className={'day-cell' + (i < filled ? ' lit' : '') + (i === todayIndex ? ' today' : '')} />
          ))}
        </div>
      )}
    </>
  );
}

function WeeklyBoard({ quest }: { quest: Quest }) {
  const status = weeklyStatus(quest);
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <>
      <div className="obj-head">Weekly Ritual</div>
      <div className="ritual">{quest.dailyAction || quest.title}</div>
      <div className="streak-stat">
        <span className="streak-day">Week streak: <b>{status.streak}</b></span>
        <span className="streak-best">Longest: {status.best} week{status.best === 1 ? '' : 's'}</span>
      </div>
      <div className="week-cap">This week · <b>{status.thisWeekCount}</b> / {status.target}</div>
      <div className="week-strip">
        {status.days.map((d, i) => (
          <div key={i} className={'wday' + (d.done ? ' done' : '') + (d.isToday ? ' today' : '') + (d.future ? ' future' : '')}>
            <span className="wday-dot"></span>
            <span className="wday-lbl">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="obj-head" style={{ marginTop: '20px' }}>Weeks Sustained · {status.streak}/{status.weeksTarget}</div>
      <div className="day-grid">
        {Array.from({ length: status.weeksTarget }, (_, i) => (
          <span key={i} className={'day-cell' + (i < status.streak ? ' lit' : '') + (i === status.streak ? ' today' : '')} />
        ))}
      </div>
    </>
  );
}

interface Props {
  quest: Quest | null;
  region?: RegionDef;
  onToggleObj: (oid: string) => void;
  onLogObj: (oid: string, delta: number) => void;
  onComplete: () => void;
  onCheckIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function DetailPanel({ quest, region, onToggleObj, onLogObj, onComplete, onCheckIn, onEdit, onDelete, onToggleActive }: Props) {
  if (!quest) {
    return (
      <div className="detail">
        <span className="corner tl"></span><span className="corner tr"></span>
        <span className="corner bl"></span><span className="corner br"></span>
        <div className="detail-empty">Select a quest from the log<br />to read its tale.</div>
      </div>
    );
  }

  const dl = fmtDeadline(quest.deadline);
  const isStreak = quest.mode === 'streak';
  const isWeekly = quest.mode === 'weekly';
  const status = isStreak ? streakStatus(quest) : null;
  const wstatus = isWeekly ? weeklyStatus(quest) : null;
  const target = quest.targetDays || 30;
  const tasks = quest.objectives.filter(o => !o.recurring);
  const done = tasks.filter(o => o.done).length;
  const pct = isStreak && status
    ? Math.round((status.current / target) * 100)
    : isWeekly && wstatus
    ? Math.round((wstatus.streak / wstatus.weeksTarget) * 100)
    : (tasks.length ? Math.round((done / tasks.length) * 100) : 0);
  const allDone = tasks.length === 0 || done === tasks.length;

  return (
    <div className="detail" key={quest.id} style={{ '--cat': region?.color } as React.CSSProperties}>
      <span className="corner tl"></span><span className="corner tr"></span>
      <span className="corner bl"></span><span className="corner br"></span>

      <div className="detail-head">
        <h2>{quest.title}</h2>
        <div className="detail-tools">
          {!quest.done && (
            <button
              className="icon-btn"
              title={quest.active ? 'Unset as active destination' : 'Set as active destination'}
              onClick={onToggleActive}
              style={quest.active ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
            >
              {/* Target/destination icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
              </svg>
            </button>
          )}
          <button className="icon-btn" title="Edit quest" onClick={onEdit}>{Ico.edit()}</button>
          <button className="icon-btn" title="Delete quest" onClick={onDelete}>{Ico.trash()}</button>
        </div>
      </div>

      <div className="detail-sub">
        <span className="giver"><span className="bang">!</span>{quest.giver || 'You'}</span>
        {dl && <span className={'deadline-tag' + (dl.soon ? ' soon' : '')}>{Ico.clock()} {dl.label}, {dl.year} · {dl.rel}</span>}
        <span className="region-tag">{quest.region}</span>
      </div>

      <div className="detail-rule"></div>

      <div className="detail-scroll">
        <p className="lore">{quest.lore || <em style={{ color: 'var(--ink-faint)' }}>No lore written yet.</em>}</p>

        {isStreak && <StreakBoard quest={quest} />}
        {isWeekly && <WeeklyBoard quest={quest} />}

        {!isStreak && !isWeekly && quest.objectives.length > 0 && (
          <>
            <div className="obj-head">Objectives</div>
            {quest.objectives.map(o => o.recurring
              ? <HabitObjective key={o.id} o={o} frozen={quest.done} onLog={(d) => onLogObj(o.id, d)} />
              : (
                <div key={o.id} className={'objective' + (o.done ? ' checked' : '')}
                     onClick={() => !quest.done && onToggleObj(o.id)}>
                  <span className="checkbox"></span>
                  <span className="obj-text">{o.text}</span>
                </div>
              ))}
          </>
        )}
      </div>

      <div className="detail-foot">
        {quest.done ? (
          <div className="complete-stamp">COMPLETE<small>Cleared from the log</small></div>
        ) : isWeekly && wstatus ? (
          <>
            <div className="progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
              <span className="progress-num">{wstatus.streak}/{wstatus.weeksTarget} wk</span>
            </div>
            <div className={'streak-note' + (wstatus.weekMet ? ' ok' : wstatus.atRisk ? ' risk' : '')}>
              {wstatus.fresh ? 'Log your first session to begin the streak.'
                : wstatus.checkedToday
                  ? (wstatus.weekMet ? "This week's target is met — the streak holds." : `Logged today · ${wstatus.target - wstatus.thisWeekCount} more this week.`)
                  : wstatus.weekMet ? "You've hit this week's target — anything more is a bonus."
                  : `${wstatus.target - wstatus.thisWeekCount} more this week to keep the streak alive.`}
            </div>
            <button className="complete-btn" onClick={onCheckIn} disabled={wstatus.checkedToday}>
              {wstatus.checkedToday ? 'Logged for today ✓' : 'Log Today’s Session'}
            </button>
          </>
        ) : isStreak && status ? (
          <>
            <div className="progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
              <span className="progress-num">{status.current}/{target}</span>
            </div>
            <div className={'streak-note' + (status.broken ? ' broken' : status.atRisk ? ' risk' : status.checkedToday ? ' ok' : '')}>
              {status.checkedToday ? "Today’s flame is lit — return tomorrow to keep the chain."
                : status.broken ? `The chain broke after ${status.brokenFrom} day${status.brokenFrom === 1 ? '' : 's'}. Rekindle it to begin again.`
                : status.atRisk ? "Don’t break the chain — check in before the day ends."
                : status.fresh ? 'Light the first flame to begin your streak.'
                : 'Check in to continue your streak.'}
            </div>
            <button className="complete-btn" onClick={onCheckIn} disabled={status.checkedToday}>
              {status.checkedToday ? 'Checked in for today ✓' : status.broken ? 'Rekindle the Chain' : 'Light Today’s Flame'}
            </button>
          </>
        ) : (
          <>
            {tasks.length > 0 && (
              <div className="progress">
                <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
                <span className="progress-num">{pct}%</span>
              </div>
            )}
            <button className="complete-btn" onClick={onComplete} disabled={tasks.length > 0 && !allDone}>
              {tasks.length > 0 && !allDone ? `${tasks.length - done} objective${tasks.length - done > 1 ? 's' : ''} remaining` : 'Mark Quest Complete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Celebrate({ quest, onDone }: { quest: Quest; onDone: () => void }) {
  const sparks = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = 120 + Math.random() * 90;
    return { dx: Math.cos(a) * r + 'px', dy: Math.sin(a) * r + 'px', d: Math.random() * 0.25 };
  });
  return (
    <div className="celebrate" onClick={onDone}>
      {sparks.map((s, i) => (
        <span key={i} className="spark"
              style={{ left: '50%', top: '42%', '--dx': s.dx, '--dy': s.dy, animationDelay: s.d + 's' } as React.CSSProperties} />
      ))}
      <div className="burst">
        {questIcon(quest.type, 'seal')}
        <h3>QUEST COMPLETE</h3>
        <p>{quest.title}</p>
        <div className="sub">Tap anywhere to continue</div>
      </div>
    </div>
  );
}
