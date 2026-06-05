import React from 'react';
import { IconFlame, IconGem } from '../icons';

interface Props {
  streak: number;
  maxStreak: number;
  cleared: number;
  total: number;
}

export function StatusBar({ streak, maxStreak, cleared, total }: Props) {
  const pips = Array.from({ length: maxStreak }, (_, i) => i < streak);
  const maxed = streak >= maxStreak;
  return (
    <div className="statusbar">
      <div className={'streak' + (maxed ? ' maxed' : '')}>
        <div className="streak-pips">
          {pips.map((on, i) => <IconFlame key={i} className={'pip' + (on ? '' : ' spent')} />)}
        </div>
        <span className="streak-label" key={streak}><b>{streak}</b>-day streak</span>
      </div>
      <div className="title-block">
        <h1>ADVENTURE LOG</h1>
        <div className="dots"><i></i><i></i><i></i></div>
      </div>
      <div className="coin">
        <IconGem className="gem" />
        <span className="count">{cleared}</span>
        <span className="unit">/ {total} cleared</span>
      </div>
    </div>
  );
}
