let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let wet: GainNode | null = null;
let enabled = true;

function makeImpulse(seconds: number, decay: number): AudioBuffer {
  const rate = ctx!.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx!.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

function ensure(): boolean {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(1.6, 3.2);
    wet = ctx.createGain();
    wet.gain.value = 0.30;
    reverb.connect(wet); wet.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

interface PluckOpts { dur?: number; vol?: number; type?: OscillatorType; harm?: number; attack?: number; delay?: number; }

function pluck(freq: number, { dur = 0.5, vol = 0.5, type = 'sine', harm = 0.35, attack = 0.008, delay = 0 }: PluckOpts = {}) {
  if (!enabled || !ensure()) return;
  const t = ctx!.currentTime + delay;
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(master!); g.connect(reverb!);
  const o = ctx!.createOscillator();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  o.connect(g); o.start(t); o.stop(t + dur + 0.05);
  if (harm > 0) {
    const o2 = ctx!.createOscillator();
    const g2 = ctx!.createGain();
    o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2.01, t);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * harm, t + attack);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
    o2.connect(g2); g2.connect(master!); g2.connect(reverb!);
    o2.start(t); o2.stop(t + dur + 0.05);
  }
}

function tok(freq = 300, vol = 0.4) {
  if (!enabled || !ensure()) return;
  const t = ctx!.currentTime;
  const o = ctx!.createOscillator();
  const g = ctx!.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.07);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  o.connect(g); g.connect(master!); g.connect(reverb!);
  o.start(t); o.stop(t + 0.14);
}

export const SFX = {
  setEnabled(v: boolean) { enabled = !!v; },
  resume() { ensure(); },
  move()     { tok(300, 0.38); },
  select()   { pluck(392, { dur: 0.45, vol: 0.28, harm: 0.22 }); },
  click()    { pluck(523.25, { dur: 0.4, vol: 0.42 }); },
  check()    { pluck(659.25, { dur: 0.5, vol: 0.45 }); pluck(987.77, { dur: 0.7, vol: 0.4, delay: 0.06 }); },
  checkSoft(){ pluck(659.25, { dur: 0.3, vol: 0.17 }); pluck(987.77, { dur: 0.4, vol: 0.14, delay: 0.05 }); },
  back()     { pluck(392, { dur: 0.5, vol: 0.4 }); pluck(293.66, { dur: 0.6, vol: 0.3, delay: 0.05 }); },
  confirm()  { pluck(523.25, { dur: 0.6, vol: 0.45 }); pluck(783.99, { dur: 0.75, vol: 0.38, delay: 0.05 }); },
  // "destination set" — a deep low pulse followed by a rising shimmer
  setActive() {
    if (!enabled || !ensure()) return;
    const t = ctx!.currentTime;
    // Low thud
    const o1 = ctx!.createOscillator();
    const g1 = ctx!.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(110, t);
    o1.frequency.exponentialRampToValueAtTime(60, t + 0.18);
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(0.55, t + 0.01);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o1.connect(g1); g1.connect(master!);
    o1.start(t); o1.stop(t + 0.25);
    // Rising shimmer overtop
    pluck(440, { dur: 0.6, vol: 0.38, harm: 0.5, delay: 0.08 });
    pluck(659.25, { dur: 0.5, vol: 0.28, harm: 0.3, delay: 0.18 });
  },
  complete() {
    const notes = [523.25, 587.33, 698.46, 880, 1046.5];
    notes.forEach((f, i) => pluck(f, { dur: 1.0, vol: 0.46, harm: 0.4, delay: i * 0.12 }));
    pluck(1318.5, { dur: 1.4, vol: 0.3, harm: 0.5, delay: 0.6 });
  },
};

// unlock audio on first user interaction
function unlock() { ensure(); window.removeEventListener('pointerdown', unlock); }
window.addEventListener('pointerdown', unlock);
