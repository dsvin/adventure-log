import React, { useState } from 'react';
import type { Quest, Objective } from '../data/schema';
import { REGIONS } from '../data/schema';
import { IconMain, IconShrine, IconSide, Ico } from '../icons';
import { uid } from '../data/helpers';

const TYPE_INFO = [
  { key: 'main',   Icon: IconMain,   name: 'Main',   desc: 'A Grand Life Objective' },
  { key: 'shrine', Icon: IconShrine, name: 'Shrine', desc: 'A path of self-mastery' },
  { key: 'side',   Icon: IconSide,   name: 'Side',   desc: 'An optional pursuit' },
] as const;

function Stepper({ value, set, min, max, unit }: { value: number; set: (v: number) => void; min: number; max: number; unit: string }) {
  const v = value || min;
  return (
    <div className="stepper">
      <button type="button" className="step-btn" onClick={() => set(Math.max(min, v - 1))} disabled={v <= min}>−</button>
      <span className="step-val">{v}</span>
      <span className="step-unit">{unit}</span>
      <button type="button" className="step-btn" onClick={() => set(Math.min(max, v + 1))} disabled={v >= max}>+</button>
    </div>
  );
}

interface Props {
  initial: Quest;
  onSave: (q: Quest) => void;
  onCancel: () => void;
  onTypeChange: (type: string) => void;
}

export function QuestModal({ initial, onSave, onCancel, onTypeChange }: Props) {
  const isEdit = !!(initial.title || initial.lore || initial.objectives.length > 0);
  const [type, setType] = useState(initial.type);
  const [title, setTitle] = useState(initial.title);
  const [region, setRegion] = useState(initial.region);
  const [giver, setGiver] = useState(initial.giver);
  const [deadline, setDeadline] = useState(initial.deadline);
  const [lore, setLore] = useState(initial.lore);
  const [objs, setObjs] = useState<Objective[]>(
    initial.objectives.length ? initial.objectives.map(o => ({ ...o })) : [{ id: 'n1', text: '', done: false }]
  );
  const [mode, setMode] = useState(initial.mode || 'checklist');
  const [targetDays, setTargetDays] = useState(initial.targetDays || 30);
  const [dailyAction, setDailyAction] = useState(initial.dailyAction || '');
  const [timesPerWeek, setTimesPerWeek] = useState(initial.timesPerWeek || 3);
  const [weeksTarget, setWeeksTarget] = useState(initial.weeksTarget || 8);

  const chooseType = (k: typeof type) => { setType(k); onTypeChange(k); };

  const setObj = (id: string, text: string) => setObjs(objs.map(o => o.id === id ? { ...o, text } : o));
  const setObjField = (id: string, patch: Partial<Objective>) => setObjs(objs.map(o => o.id === id ? { ...o, ...patch } : o));
  const cycleRecur = (id: string) => setObjs(objs.map(o => {
    if (o.id !== id) return o;
    const next = !o.recurring ? 'weekly' : o.recurring === 'weekly' ? 'daily' : null;
    return { ...o, recurring: next as any, target: o.target || 5, count: o.count || 0, period: o.period || '' };
  }));
  const addObj = () => setObjs([...objs, { id: 'n' + uid(), text: '', done: false }]);
  const rmObj = (id: string) => setObjs(objs.filter(o => o.id !== id));

  const save = () => {
    const cleaned = objs.filter(o => o.text.trim()).map(o => {
      const base = { ...o, text: o.text.trim() };
      if (o.recurring) base.target = Math.max(1, Math.min(99, parseInt(String(o.target), 10) || 1));
      return base;
    });
    const td = Math.max(2, Math.min(366, parseInt(String(targetDays), 10) || 30));
    onSave({
      ...initial, type, title: title.trim(), region,
      giver: giver.trim() || 'You', deadline, lore: lore.trim(),
      mode,
      objectives: mode === 'checklist' ? cleaned : [],
      targetDays: td, dailyAction: dailyAction.trim(),
      timesPerWeek, weeksTarget,
    });
  };

  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">{isEdit ? 'Amend the entry' : 'A new endeavor'}</div>
            <h2>{isEdit ? 'Edit Quest' : 'Forge a New Quest'}</h2>
          </div>
          <button className="icon-btn" onClick={onCancel}>{Ico.close()}</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Quest Type</label>
            <div className="type-picker">
              {TYPE_INFO.map(t => (
                <div key={t.key} className={'type-opt' + (type === t.key ? ' sel' : '')} onClick={() => chooseType(t.key)}>
                  <t.Icon />
                  <span className="tname">{t.name}</span>
                  <span className="tdesc">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Title</label>
            <input type="text" value={title} autoFocus placeholder="e.g. Trial of the Triathlon"
                   onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Region / Category</label>
              <select value={region} onChange={e => setRegion(e.target.value)}>
                {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Target Date</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Quest-Giver</label>
            <input type="text" value={giver} placeholder="Who set this quest? (e.g. Future Self, The Coach)"
                   onChange={e => setGiver(e.target.value)} />
          </div>

          <div className="field">
            <label>Description / Lore</label>
            <textarea value={lore} placeholder="Why does this quest matter? Write it like the opening of a tale…"
                      onChange={e => setLore(e.target.value)} />
          </div>

          <div className="field">
            <label>Quest Format</label>
            <div className="format-toggle three">
              <button type="button" className={'fmt-opt' + (mode === 'checklist' ? ' sel' : '')} onClick={() => setMode('checklist')}>
                <span className="fmt-name">Checklist</span>
                <span className="fmt-desc">Objectives to tick off</span>
              </button>
              <button type="button" className={'fmt-opt' + (mode === 'streak' ? ' sel' : '')} onClick={() => setMode('streak')}>
                <span className="fmt-name">Daily Streak</span>
                <span className="fmt-desc">Every day, N in a row</span>
              </button>
              <button type="button" className={'fmt-opt' + (mode === 'weekly' ? ' sel' : '')} onClick={() => setMode('weekly')}>
                <span className="fmt-name">Weekly Streak</span>
                <span className="fmt-desc">N times per week</span>
              </button>
            </div>
          </div>

          {mode === 'checklist' && (
            <div className="field">
              <label>Objectives</label>
              {objs.map((o, i) => (
                <div className="obj-edit-row" key={o.id}>
                  <span className="dragdot">◆</span>
                  <input type="text" value={o.text} placeholder={`Objective ${i + 1}`}
                         onChange={e => setObj(o.id, e.target.value)}
                         onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addObj(); } }} />
                  {o.recurring && (
                    <div className="recur-target">
                      <input type="number" min="1" max="99" value={o.target || 5}
                             onChange={e => setObjField(o.id, { target: parseInt(e.target.value) })} />
                      <span>/{o.recurring === 'daily' ? 'day' : 'wk'}</span>
                    </div>
                  )}
                  <button type="button" className={'recur-btn' + (o.recurring ? ' on' : '')}
                          title="Repeat this objective" onClick={() => cycleRecur(o.id)}>
                    {o.recurring === 'weekly' ? '↻ Weekly' : o.recurring === 'daily' ? '↻ Daily' : 'Once'}
                  </button>
                  {objs.length > 1 && <button className="rm" onClick={() => rmObj(o.id)}>{Ico.close()}</button>}
                </div>
              ))}
              <button className="add-obj" onClick={addObj}>+ Add objective</button>
              <div className="obj-hint">Tip: mark an objective <b>↻ Weekly</b> or <b>↻ Daily</b> to make it a recurring habit. It won't block completion — finish the one-time objectives and the quest is done.</div>
            </div>
          )}

          {mode === 'streak' && (
            <div className="field-row">
              <div className="field">
                <label>Daily Ritual</label>
                <input type="text" value={dailyAction} placeholder="e.g. Meditate 10 minutes"
                       onChange={e => setDailyAction(e.target.value)} />
              </div>
              <div className="field">
                <label>Days In A Row</label>
                <Stepper value={targetDays} set={setTargetDays} min={2} max={366} unit="days" />
              </div>
            </div>
          )}

          {mode === 'weekly' && (
            <>
              <div className="field">
                <label>Weekly Ritual</label>
                <input type="text" value={dailyAction} placeholder="e.g. Train at the gym"
                       onChange={e => setDailyAction(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Times Per Week</label>
                  <Stepper value={timesPerWeek} set={setTimesPerWeek} min={1} max={7} unit="× / week" />
                </div>
                <div className="field">
                  <label>Weeks To Sustain</label>
                  <Stepper value={weeksTarget} set={setWeeksTarget} min={2} max={52} unit="weeks" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={!title.trim()} onClick={save}>
            {isEdit ? 'Save Changes' : 'Add to Log'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDelete({ quest, onConfirm, onCancel }: { quest: Quest; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="confirm" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-box">
        <h3>Abandon this quest?</h3>
        <p>"{quest.title}" will be struck from your Adventure Log for good. This cannot be undone.</p>
        <div className="row">
          <button className="btn-ghost" onClick={onCancel}>Keep it</button>
          <button className="btn-ghost danger" onClick={onConfirm}>Abandon Quest</button>
        </div>
      </div>
    </div>
  );
}
