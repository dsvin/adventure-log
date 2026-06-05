import React from 'react';
import { IconMain, IconShrine, IconSide } from '../icons';

const TAB_DEFS = [
  { key: 'main',   label: 'Main Quests',   Icon: IconMain },
  { key: 'shrine', label: 'Shrine Quests', Icon: IconShrine },
  { key: 'side',   label: 'Side Quests',   Icon: IconSide },
];

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

export function TabRail({ active, onChange }: Props) {
  const cur = TAB_DEFS.find(t => t.key === active)!;
  return (
    <div className="tabrail">
      <span className="tab-section-label">{cur.label}</span>
      <div className="tabs">
        {TAB_DEFS.map(t => (
          <button key={t.key} className={'tab' + (t.key === active ? ' active' : '')}
                  onClick={() => onChange(t.key)} title={t.label}>
            <t.Icon />
            {t.key === active && <span className="nub">▾</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
