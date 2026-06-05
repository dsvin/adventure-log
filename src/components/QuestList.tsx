import React from 'react';
import type { Quest, RegionDef } from '../data/schema';
import { questIcon, Ico } from '../icons';
import { fmtDeadline, streakStatus, weeklyStatus } from '../data/helpers';

interface RowProps {
  quest: Quest;
  selected: boolean;
  onClick: () => void;
  onToggleActive: () => void;
  region?: RegionDef;
}

export function QuestRow({ quest, selected, onClick, onToggleActive, region }: RowProps) {
  const dl = fmtDeadline(quest.deadline);
  const isStreak = quest.mode === 'streak';
  const isWeekly = quest.mode === 'weekly';
  const tasks = quest.objectives.filter(o => !o.recurring);
  const total = tasks.length;
  const done = tasks.filter(o => o.done).length;
  const streakCur = isStreak ? streakStatus(quest).current : 0;
  const wstat = isWeekly ? weeklyStatus(quest) : null;

  return (
    <div
      className={'quest-row' + (selected ? ' selected' : '') + (quest.done ? ' done' : '')}
      onClick={onClick}
      style={{ '--cat': region?.color } as React.CSSProperties}
    >
      <span className="qicon">{questIcon(quest.type)}</span>
      <div className="qbody">
        <div className="qtitle">{quest.title}</div>
        <div className="qmeta">
          {quest.region}
          {isStreak ? ' · daily' : isWeekly ? ' · weekly' : (dl ? ` · ${dl.rel}` : '')}
        </div>
      </div>
      <div className="qright">
        {!quest.done && isStreak && <span className="qprog">{streakCur}/{quest.targetDays} days</span>}
        {!quest.done && isWeekly && wstat && <span className="qprog">{wstat.streak}/{quest.weeksTarget} wk</span>}
        {!quest.done && !isStreak && !isWeekly && total > 0 && <span className="qprog">{done}/{total}</span>}
        {!quest.done && (
          <span
            className={quest.active ? 'active-ring' : 'qdot'}
            title={quest.active ? 'Active quest — click to unset' : 'Set as active quest'}
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            style={{ cursor: 'pointer' }}
          >
            {quest.active && <i></i>}
          </span>
        )}
        {quest.done && <span className="qdot"></span>}
      </div>
    </div>
  );
}

interface ListProps {
  quests: Quest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onToggleActive: (id: string) => void;
  regions: Record<string, RegionDef>;
}

export function QuestList({ quests, selectedId, onSelect, onNew, onToggleActive, regions }: ListProps) {
  const cleared = quests.filter(q => q.done).length;
  return (
    <div className="questlist-wrap">
      <div className="questlist">
        {quests.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ink-faint)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '19px', padding: '40px 0' }}>
            No quests here yet.<br />Forge your first one below.
          </div>
        )}
        {quests.map(q => (
          <QuestRow key={q.id} quest={q} region={regions[q.region]}
                    selected={q.id === selectedId}
                    onClick={() => onSelect(q.id)}
                    onToggleActive={() => onToggleActive(q.id)} />
        ))}
      </div>
      <div className="list-foot">
        <span><b>{cleared}</b> / {quests.length} cleared</span>
        <button className="new-quest-btn" onClick={onNew}>{Ico.plus()} Forge New Quest</button>
      </div>
    </div>
  );
}
